import { MainInbox } from "./MainInbox";
import { MobileInbox } from "./MobileInbox";

export const Inbox = ({ messages }) => {
  return (
    <div className="flex justify-center mt-8 px-4">
      <MainInbox messages={messages}/>
      <MobileInbox messages={messages}/>
    </div>
  );
};