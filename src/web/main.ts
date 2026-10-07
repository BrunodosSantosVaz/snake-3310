import './styles.css';
import { mountUi } from './ui.js';

mountUi(document, (url, options) => fetch(url, options));
