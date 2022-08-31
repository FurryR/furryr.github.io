/**
 * This program was under the MIT license.
 * Copyright(c) FurryR 2022.
 */
/**
 * Terminal 类。
 * 基本终端实现。
 */
export declare class Terminal {
    private obj;
    private input;
    private buffer;
    private inputlock;
    private span;
    private resolve;
    private ret;
    /**
     * 设定 Terminal 的内容。
     * @param elem 要写入的内容。
     */
    setContent(elem: (string | HTMLElement)[]): void;
    /**
     * 从 Terminal 读取一个字。不回显。
     * @returns 用于获得用户输入内容的 Promise。
     */
    getch(): Promise<string>;
    /**
     * 构造一个 Terminal。
     * @param obj 目标元素。
     */
    constructor(obj: HTMLElement);
}
/**
 * RichTerminal 类。
 * 更好的 Terminal 包装。
 * 注意:RichTerminal 和 Terminal 不应并用。
 */
export declare class RichTerminal {
    private obj;
    private term_buffer;
    private _cursor;
    private putchar;
    /**
     * 获得当前光标位置。
     */
    get cursor(): number;
    /**
     * 设置当前光标位置。
     */
    set cursor(newVal: number);
    /**
     * 获得当前缓冲区大小。
     */
    get length(): number;
    /**
     * 清除 Terminal 的内容。
     */
    clear(): void;
    /**
     * 对 Terminal setContent 的包装。
     * @param elem 要写入的内容。
     */
    setContent(elem: HTMLElement[]): void;
    /**
     * 对 Terminal getch 的包装。
     * @returns 用于获得用户输入内容的Promise。
     */
    getch(): Promise<string>;
    /**
     * 在 Terminal 追加写入多个字符串或元素。
     * @param str 要写入的字符串。
     */
    write(...str: (string | HTMLElement)[]): void;
    /**
     * 获得一行文字，不带换行。回显。
     */
    getline(): Promise<string>;
    /**
     * 构造一个 RichTerminal。
     * @param obj 目标 Terminal。
     */
    constructor(obj: Terminal);
}
