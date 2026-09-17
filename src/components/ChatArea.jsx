import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, Download, Sparkles } from 'lucide-react';
import { Highlight } from 'prism-react-renderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import AstraLogo from './AstraLogo';

const githubDarkTheme = {
  plain: {
    color: '#e6edf3',
    backgroundColor: 'transparent',
  },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#8b949e', fontStyle: 'italic' } },
    { types: ['punctuation'], style: { color: '#c9d1d9' } },
    { types: ['namespace'], style: { opacity: 0.7 } },
    { types: ['tag', 'operator', 'number', 'boolean', 'constant', 'symbol', 'deleted'], style: { color: '#79c0ff' } },
    { types: ['property'], style: { color: '#79c0ff' } },
    { types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted', 'attr-value', 'regex'], style: { color: '#a5d6ff' } },
    { types: ['variable'], style: { color: '#ffa657' } },
    { types: ['function'], style: { color: '#d2a8ff' } },
    { types: ['keyword'], style: { color: '#ff7b72' } },
    { types: ['class-name'], style: { color: '#ffa657' } },
    { types: ['entity', 'url'], style: { color: '#79c0ff' } },
  ],
};

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const rawLang = (language || '').trim().toLowerCase();
  const safeLanguage = (!rawLang || /^\{.*\}$/.test(rawLang)) ? 'text' : rawLang;

  const safeCode = (!code || !code.trim() || /^\{code\}$/.test(code.trim()))
    ? '// (Không có nội dung)'
    : code.replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(safeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([safeCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${Date.now()}.${safeLanguage === 'text' ? 'txt' : safeLanguage}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] text-[13px] font-semibold text-gray-400">
        <span className="capitalize text-gray-300">{safeLanguage}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            title="Sao chép"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? <span>Đã sao chép</span> : <span>Sao chép</span>}
          </button>
          <button
            onClick={handleDownload}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            title="Tải xuống"
          >
            <Download size={14} />
            <span>Tải xuống</span>
          </button>
        </div>
      </div>

      <Highlight theme={githubDarkTheme} code={safeCode} language={safeLanguage}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 overflow-x-auto text-[15px] leading-relaxed font-mono`}
            style={{ ...style, backgroundColor: 'transparent' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  if (typeof content !== 'string' || !content) return null;

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');

            const isMultiLine = node?.position
              ? node.position.start.line !== node.position.end.line
              : codeText.includes('\n');

            if (match || isMultiLine) {
              return <CodeBlock language={match?.[1] || 'text'} code={codeText} />;
            }

            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function ChatArea({ messages, isLoading, loadingType = "chat" }) {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isImageLoading = loadingType === "image";

  return (
    <div className="flex-1 overflow-y-auto p-4 md:px-8 md:py-8 bg-white flex flex-col">
      <div className="max-w-[720px] w-full mx-auto space-y-8">
        {(messages || []).map((msg, idx) => {
          if (!msg) return null;
          const isUser = msg.role === 'user';

          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-4 ${
                  isUser ? 'bg-[#F5F5F5] text-[#1A1A1A]' : 'bg-transparent text-[#1A1A1A] w-full'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-2 mb-3">
                    <AstraLogo size={22} className="shrink-0" />
                    <span className="font-semibold text-[15.5px] text-[#1A1A1A]">Astra AI</span>
                  </div>
                )}

                {msg.type === 'image' ? (
                  <img
                    src={msg.content}
                    alt="AI Generated"
                    className="rounded-2xl mt-1 w-full max-w-lg shadow-lg border border-[#E5E5E5]"
                  />
                ) : (
                  <div className="leading-relaxed text-[16px] text-[#1A1A1A]">
                    {Array.isArray(msg.content) ? (
                      <div className="flex flex-col gap-3">
                        {msg.content.map((item, i) => {
                          if (item?.type === 'image_url') {
                            return (
                              <img
                                key={i}
                                src={item?.image_url?.url}
                                alt="Uploaded"
                                className="rounded-xl max-w-sm border border-[#E5E5E5]"
                              />
                            );
                          }
                          return (
                            <div key={i}>
                              <MarkdownRenderer content={item?.text || ''} />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        {typeof msg.content === 'object' && msg.content !== null
                          ? JSON.stringify(msg.content)
                          : <MarkdownRenderer content={msg.content || ''} />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-3xl py-4 bg-transparent text-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-3">
                <AstraLogo size={22} className="shrink-0" />
                <span className="font-semibold text-[15.5px] text-[#1A1A1A]">Astra AI</span>
              </div>

              {isImageLoading ? (
                <div className="flex items-center gap-2.5 ml-1">
                  <Sparkles
                    size={16}
                    className="text-[#4D6BFE] animate-pulse"
                    strokeWidth={2}
                  />
                  <span className="shimmer-text text-[15.5px] font-medium">
                    Đang tạo ảnh...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-1">
                  <span className="shimmer-text text-[15.5px] font-medium">
                    Đang suy nghĩ
                  </span>
                  <span className="flex items-end gap-1 h-4">
                    <span
                      className="wave-dot w-1.5 h-1.5 rounded-full bg-[#8B8B8B]"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="wave-dot w-1.5 h-1.5 rounded-full bg-[#8B8B8B]"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="wave-dot w-1.5 h-1.5 rounded-full bg-[#8B8B8B]"
                      style={{ animationDelay: '300ms' }}
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
}