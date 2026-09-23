import app from "../Backend/app.js";

export default function handler(req, res) {
  return app(req, res);
}
