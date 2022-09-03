import { RichTerminal, Terminal } from './cli-web.js';
export interface RawFile {
    type: 'file';
    content: string;
}
/** 文件。 */
export declare class File {
    /** 文件内容。 */
    content: string;
    /** 转换为JSON。 */
    toJSON(): RawFile;
    /**
     * 从JSON转换。
     * @param s 目标。
     * @returns 转换完成的对象。
     */
    static from(s: RawFile): File;
    constructor(content: string);
}
export interface RawDirectory {
    type: 'directory';
    content: Record<string, RawFile | RawDirectory>;
}
/** 文件夹 */
export declare class Directory {
    private map;
    /**
     * 用于消除eslint错误。
     * @returns this对象
     */
    private self;
    /**
     * 获取文件或文件夹。
     * @param path 路径。
     * @returns    获取结果。可能失败。
     * @throws     Error
     */
    get(path: string): File | Directory | undefined;
    /**
     * 判断文件或文件夹是否存在。
     * @param path 路径。
     * @returns    -1：路径有误。0：不存在。1：文件。2：文件夹。
     */
    test(path: string): -1 | 0 | 1 | 2;
    /**
     * 设定文件或文件夹。
     * @param path 路径。
     * @returns    设定结果。可能失败。
     * @throws     Error
     */
    set(path: string, content: Directory | File): void;
    /**
     * 删除文件或文件夹。
     * @param path 路径。
     * @returns    删除结果。可能失败。
     * @throws     Error
     */
    remove(path: string): void;
    /**
     * 列出文件和文件夹。
     * @returns 用于迭代列表的迭代器。
     */
    list(): IterableIterator<[string, File | Directory]>;
    /**
     * 转换为JSON。
     * @returns JSON。
     */
    toJSON(): RawDirectory;
    /**
     * 从JSON转换。
     * @param s JSON。
     * @returns 转换后的对象。
     */
    static from(s: RawDirectory): Directory;
    constructor(files?: Map<string, File | Directory>);
}
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
    start: (handler: Terminal, fs: Directory) => Promise<void>;
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
    start: (handler: Handler, args: string[]) => Promise<number>;
}
export declare class AppIndex {
    private _fs;
    private static stringify;
    private static parse;
    private fs_unwrap;
    private static file_unwrap;
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
     * 删除由名字指定的App。
     * @param name 名字。
     * @returns    是否成功删除。
     */
    remove(name: string): boolean;
    constructor(fs: Directory);
}
/**
 * 应用上下文。允许应用使用此上下文进行命令执行、安装/卸载应用、或获得终端等。
 */
export declare class Handler {
    private _term;
    private _fs;
    /**
     * 获得当前的终端。
     */
    get term(): RichTerminal;
    /**
     * 获得应用管理器上下文。
     */
    get app(): AppIndex;
    /**
     * 获得文件系统上下文。
     */
    get fs(): Directory;
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
    constructor(term: RichTerminal, fs: Directory);
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
