export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

export const WEB_VERSION = import.meta.env.VITE_WEB_VERSION || "0.0.0";

export const SCRIPT_TAG_CODE = `<script 
  src="${SERVER_URL}/t.js"
  data-api-key="your-project-key"
></script>`;
