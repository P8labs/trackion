export const SERVER_URL = import.meta.env.SERVER_URL || "http://localhost:8000";

export const SCRIPT_TAG_CODE = `<script 
  src="${SERVER_URL}/t.js"
  data-project="your-project-key"
></script>`;
