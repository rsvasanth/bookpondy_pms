import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const common_site_config_path = path.resolve(__dirname, '../../../sites/common_site_config.json');
const common_site_config = JSON.parse(fs.readFileSync(common_site_config_path, 'utf-8'));
const { webserver_port } = common_site_config;

export default {
	'^/(app|api|assets|files|private)': {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function () {
			// For development, we want to route to pms.local
			return `http://pms.local:${webserver_port}`;
		}
	}
};
