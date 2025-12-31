import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { safeFormatDate } from "@/lib/utils"; // reuse existing helper

type GuestChatPanelProps = {
    queries: any[]; // list of guest queries
    guestName?: string; // name of the guest for avatars
    onSend: (msg: string) => void; // callback to create a new query
};

export const GuestChatPanel = ({ queries, guestName, onSend }: GuestChatPanelProps) => {
    const [msg, setMsg] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(true);

    const handleSend = () => {
        if (!msg.trim()) return;
        onSend(msg);
        setMsg("");
    };

    if (!isOpen) {
        return (
            <Button
                variant="secondary"
                size="icon"
                className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg z-50 border border-primary/20"
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare className="h-6 w-6" />
                {queries?.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                        {queries.length}
                    </span>
                )}
            </Button>
        );
    }

    return (
        <div className="fixed right-4 top-20 w-[30rem] max-w-[95%] h-[calc(100vh-100px)] bg-background/95 backdrop-blur-md border border-muted rounded-2xl shadow-2xl flex flex-col p-4 z-50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Guest Communication</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
            </div>

            <ScrollArea className="flex-1 pr-2 -mr-2 mb-3">
                {queries?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Start a conversation with the guest</p>
                    </div>
                ) : (
                    queries.map((q, idx) => (
                        <div key={q.name || `msg-${idx}`} className="flex gap-3 mb-4">
                            <Avatar className="h-8 w-8 shrink-0 border">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${q.guest_name || guestName || 'Guest'}`} />
                                <AvatarFallback>{(q.guest_name || guestName || "G")[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="bg-muted rounded-lg p-3 rounded-tl-none">
                                    <p className="text-sm">{q.query_text}</p>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1 block">
                                    {safeFormatDate(q.query_date, "MMM dd 'at' HH:mm")}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </ScrollArea>

            <div className="flex gap-2 mt-2 pt-2 border-t">
                <Textarea
                    placeholder="Type your message..."
                    className="flex-1 min-h-[80px] resize-none"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button size="icon" className="h-[80px] w-[80px]" onClick={handleSend}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
