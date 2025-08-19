import { createElement } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

import CopyText from "@/components/copyTextButton";

type MarkdownParams = Parameters<typeof Markdown>['0'];
type RemarkPlugins = MarkdownParams['remarkPlugins'];
type RehypePlugins = MarkdownParams['rehypePlugins'];
type Children = MarkdownParams['children'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractComponent<T> = Extract<T, React.ComponentType<any>>;
type InferComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

function OverrideComponentClassName<T extends keyof Components>({
  tag, props, className
}: {
  tag: T;
  props: InferComponentProps<ExtractComponent<Components[T]>>;
  className: InferComponentProps<ExtractComponent<Components[T]>>['className'];
}) {
  const { children, className: ogClassName, ...rest } = props;
  return createElement(
    tag,
    { ...rest, className: `${ogClassName} ${className}` },
    children
  );
}

const remarkPlugins: RemarkPlugins = [remarkGfm, remarkMath] as const;
const rehypePlugins: RehypePlugins = [rehypeKatex] as const;
const components: Components = {
  a: (props) => <OverrideComponentClassName tag="a" props={props} className="underline text-blue-600" />,
  h1: (props) => <OverrideComponentClassName tag="h1" props={props} className="text-3xl font-bold border-b" />,
  h2: (props) => <OverrideComponentClassName tag="h2" props={props} className="text-xl font-bold border-b" />,
  h3: (props) => <OverrideComponentClassName tag="h3" props={props} className="text-lg font-bold" />,
  h4: (props) => <OverrideComponentClassName tag="h4" props={props} className="text-md font-bold" />,
  h5: (props) => <OverrideComponentClassName tag="h5" props={props} className="text-sm font-bold" />,
  h6: (props) => <OverrideComponentClassName tag="h6" props={props} className="text-xs font-bold" />,
  ul: (props) => <OverrideComponentClassName tag="ul" props={props} className="ml-4 list-disc" />,
  ol: (props) => <OverrideComponentClassName tag="ol" props={props} className="ml-4 list-decimal" />,
  code(props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {children, className, node, ...rest} = props;
    const match = /language-(\w+)/.exec(className || '');
    if (!match) return (
      <code {...rest} className={className}>
        {children}
      </code>
    );

    return (
      <div className="border border-[rgb(40,44,52)] rounded-md my-[0.5em]">
        <div className="bg-[rgb(40,44,52)] px-[1em] pt-1 flex justify-between items-center">
          <span className="text-xs">{match && match[1]}</span>
          <CopyText text={String(children)} className="text-sm hover:cursor-pointer hover:bg-[rgb(50,54,62)]" />
        </div>
        {/* @ts-expect-error Expects child class when providing parent */}
        <SyntaxHighlighter
          {...rest}
          PreTag="div"
          customStyle={{ margin: "0" }}
          language={match[1]}
          style={oneDark}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    );
  }
} as const;

export function MarkdownRenderer({ children }: { children: Children; }) {
  return (
    <Markdown
      components={components}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
    >
      {children}
    </Markdown>
  );
}

export default MarkdownRenderer;
