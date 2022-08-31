import { RichTerminal, Terminal } from './cli-web.js';
/**
 * 用于初始化终端的应用，又称引导。默认导出必须遵循此格式。
 */
export interface BootApp {
    /** 应用包名。 */
    name: string;
    /** 应用版本。 */
    version: string;
    /** 应用注释。 */
    desc: string;
    /** 启动此应用。 */
    start(handler: Terminal): Promise<void>;
}
/**
 * 导出的一般应用。默认导出必须遵循此格式。
 */
export interface App {
    /** 应用名。同时作为可执行文件名字。 */
    name: string;
    /** 应用版本。 */
    version: string;
    /** 应用注释。 */
    desc: string;
    /** 下载此应用的地址。通常用于更新。 */
    url: string;
    /** 启动此应用。 */
    start(handler: Handler, args: string[]): Promise<number>;
}
/**
 * 应用上下文。允许应用使用此上下文进行命令执行、安装/卸载应用、或获得终端等。
 */
export declare class Handler {
    private _term;
    private _app;
    private find_index;
    /**
     * 安装应用。
     * @param app 应用包。
     */
    install(app: App): void;
    /**
     * 根据应用名寻找应用。
     * @param name 名字。
     * @returns    应用（如果有）。
     */
    find(name: string): App | undefined;
    /**
     * 列出所有应用。
     * @returns 应用列表。
     */
    list(): App[];
    /**
     * 获得当前的终端。
     */
    get term(): RichTerminal;
    /**
     * 删除由包名指定的App。
     * @param name 包名。
     * @returns    是否成功删除。
     */
    remove(name: string): boolean;
    /**
     * 以名字和参数启动应用。
     * @param cmd 应用名字。
     * @param arg 传递给应用参数。
     * @returns   应用的返回值。
     */
    exec(cmd: string, arg: string[]): Promise<number>;
    /**
     * 以命令启动应用。
     * @param cmd 命令。
     * @returns   应用的返回值。
     */
    system(cmd: string): Promise<number>;
    constructor(term: RichTerminal, app?: App[]);
}
/**
 * 生成 CSS 文本。
 * @param text  文本内容。
 * @param style CSS 设定。
 * @returns     生成的元素。
 */
export declare function CSSText(text: string, style?: Partial<CSSStyleDeclaration>): HTMLSpanElement;
/**
 * 生成链接。
 * @param text 文本内容。
 * @param link 链接。
 * @returns    生成的元素。
 */
export declare function Link(text: string, link: string): HTMLAnchorElement;
