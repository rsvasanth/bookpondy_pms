export default {
	'^/(app|api|assets|files|private)': {
		target: `http://pms.local:8000`,
		changeOrigin: true,
		headers: {
			'Host': 'pms.local'
		},
		ws: true
	},
	'^/socket.io': {
		target: `http://pms.local:9000`,
		changeOrigin: true,
		ws: true
	}
};
