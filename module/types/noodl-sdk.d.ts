declare module '@noodl/noodl-sdk' {

  export class Object {
    public static get(t: any): any;
    public static create(value: any): Object;
    public static exists(t: any): boolean;
    public static guid(): string;

    id: string;
    data: { [key: string]: any } | undefined;

    public getId(): string;
    public get(): { [key: string]: any } | undefined;

    public on(t: any, e: any): void;
    public off(t: any, e: any): void;
    public notify(t: any, e: any): void;

    public setAll(value: { [key: string]: any }): void;
    public set(key: string, value: any, notify: boolean): void;

    public toJSON(): string;
  }

  export class Array {
    public static get(t: any): any;
    public static create(value: any): Array;
    public static exists(t: any): boolean;

    id: string;
    data: { [key: string]: any } | undefined;

    public getId(): string;
    public get(): { [key: string]: any } | undefined;

    public on(t: any, e: any): void;
    public off(t: any, e: any): void;
    public notify(t: any, e: any): void;

    public setAll(value: { [key: string]: any }): void;
    public set(t: any): void;
    public contains(t: any): boolean;
    public add(t: any): void;
    public addAtIndex(t: any, e: number): void;
    public removeAtIndex(t: number): void;
    public remove(t: any): void;

    public toJSON(): string;
  }

  export type Proxy = Object | Array;



  export type Colors = {
    purple: 'component',
    green: 'data',
    default: 'default',
    grey: 'default'
  };
  
  export type TypeEditor
    = 'javascript'
    | 'graphql';

  export type Type
    = '*'
    | 'object'
    | 'array'
    | 'string'
    | 'number'
    | 'boolean'
    | 'signal'
    | { name: Type, codeeditor: TypeEditor };



  export type NodeInput = Type | {
    type: Type;
    displayName?: string;
    group?: string;
    default?: any;
  };

  export type NodeOutput = Type | {
    type: Type;
    displayName?: string;
    group?: string;
  };

  export type NodeSignal = {
    (this: NodeInstance): void;
  };

  export type NodeMethod = {
    (this: NodeInstance, ...args: any): any;
  };

  export type Node = {
    /**
     * Sets the name.
     */
    name: string;
 
    displayNodeName?: string;
    usePortAsLabel?: any;

    /**
     * Sets the color.
     */
    color?: keyof Colors;

    /**
     * Sets the category.
     */
    category?: string;

    getInspectInfo?: any;
    
    /**
     * URL to the docs page.
     */
    docs?: string;

    initialize?: () => void;

    inputs?: {
      [key: string]: NodeInput;
    };

    outputs?: {
      [key: string]: NodeOutput;
    };

    changed?: {
      [key: string]: (self: any, value: any) => void;
    }

    signals?: {
      [key: string]: NodeSignal
    };

    prototypeExtensions?: any;

    methods?: {
      [key: string]: NodeMethod
    };

    /**
     * This is called once on startup
     */
    setup?: () => void;
  };

  export type NodeDefinitionInstance = {
    node: Node;
    
    /**
     * This is called once on startup
     */
    setup: () => void;
  };

  export type NodeInstance = {
    id: string;
    context: any;
    model: any;
    nodeScope: any;
    numberedInputs: {};
    
    inputs: {
      [key: string]: any;
    };
    
    outputs: {
      [key: string]: any;
    };

    result: Proxy;

    clearWarnings(): void;
    sendWarning(name: string, message: string): void;

    setOutputs(o: { [key: string]: any }): void;



    registerInput(t: any, e: any): void;
    registerInputIfNeeded(name: string): void;
    deregisterInput(t: any): void;

    registerInputs(t: { [key: string]: any }): void;
    registerNumberedInput(t: any, e: any): void;

    getInput(name: string): { set: (n: any) => void; } | undefined;
    hasInput(name: string): boolean;
    setInputValue(t: any, e: any): void;

    // TODO: Why do I have to add a getter? Can it use the default?
    registerOutput(name: string, e: {
      get?: () => any;
      getter: () => any;
      onFirstConnectionAdded?: () => void;
      onLastConnectionRemoved?: () => void;
    }): void;

    // TODO: This is not added in the core code
    //registerOutputIfNeeded(): void;
    deregisterOutput(t: any): void;
    
    registerOutputs(t: { [key: string]: any }): void;
    
    hasOutput(t: any): boolean;
    getOutput(t: string): any;

    connectInput(t: any, e: any, n: any): void;
    removeInputConnection(t: any, e: any, n: any): void;
    isInputConnected(t: any): boolean;
    queueInput(t: any, e: any): void;
    scheduleAfterInputsHaveUpdated(t: any): void;

    update(): void;
    sendValue(t: any, e: any): void;
    setNodeModel(t: any): void;
    addDeleteListener(t: any): void;

    flagDirty(): void;
    flagOutputDirty(name: string): void;
    sendSignalOnOutput(name: string): void;
  };



  export type ReactNodeInput = {
    index?: number;
    displayName?: string;
    group?: string;
    default?: any;
    type: Type | { // TODO: this is probably the same for everything? Just have extra props?
      name: string;
      units?: string[];
      defaultUnit?: string;
    };
  };

  export type ReactNodeOutput = {
    type: Type;
    displayName?: string;
    group?: string;
  };

  export type ReactNodeInputCss = {
    index?: number;
    group?: string;
    displayName?: string;
    type: Type;
    default?: any;
  };

  export type ReactNode = {
    name: string;
    category?: string;

    /**
     * URL to the docs page.
     */
    docs?: string;

    getReactComponent: () => any;
    
    inputProps?: {
      [key: string]: ReactNodeInput
    };

    outputProps?: {
      [key: string]: ReactNodeOutput
    };

    inputCss?: any;
    setup?: any;

    frame?: {
      margins?: boolean;
      position?: boolean;
      align?: boolean;
    };
  };

  export type ReactNodeDefinition = {

  };



  export function defineNode(def: Node): NodeDefinitionInstance;
  export function defineReactNode(def: ReactNode): ReactNodeDefinition;
  export function defineModule(def: {
    reactNodes: ReactNodeDefinition[];
    nodes: NodeDefinitionInstance[];

    /**
     * This is called once on startup
     */
    setup: () => void;
  }): void;
}
