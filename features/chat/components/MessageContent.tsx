import { Streamdown } from "streamdown";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="space-y-3 text-slate-800 leading-relaxed [&_p]:my-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_strong]:text-slate-900 [&_strong]:font-semibold [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:text-[#1E40AF] [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:font-mono [&_a]:text-[#1E40AF] [&_a]:underline [&_pre]:whitespace-pre [&_pre_code]:whitespace-pre [&_pre]:overflow-x-auto">
      <Streamdown>{content}</Streamdown>
    </div>
  );
}