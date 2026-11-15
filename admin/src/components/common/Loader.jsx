import { Loader2 } from "lucide-react";
import "./Loader.css";

export default function Loader({ text = "Loading...", fullScreen = false }) {
  const content = (
    <div className={`ld-container ${fullScreen ? "ld-fullscreen" : ""}`}>
      <Loader2 className="ld-spinner" size={32} />
      {text && <p className="ld-text">{text}</p>}
    </div>
  );

  return content;
}