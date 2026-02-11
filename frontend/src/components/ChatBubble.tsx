type ChatBubbleProps = {
  text: string;
  sender: "user" | "match";
};

const ChatBubble = ({ text, sender }: ChatBubbleProps) => {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-3 text-sm leading-relaxed rounded-[20px] shadow-md ${
          isUser
            ? "bg-rose text-primary-foreground rounded-br-[6px]"
            : "bg-card text-foreground rounded-bl-[6px]"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatBubble;
