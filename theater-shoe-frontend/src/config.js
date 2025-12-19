// Wenn wir in der Cloud sind, nutzen wir die Cloud-Adresse, sonst localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';

export default API_URL;