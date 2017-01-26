export type KeyCallback = (keyCode: number, event: KeyboardEvent) => void;

export class Key extends Dispatcher {
  private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
  private static _KEYDOWN_EVENT_NAME = "keydown";
  private static _KEYUP_EVENT_NAME = "keyup";

  /**
   * Gets a Key Dispatcher. If one already exists it will be returned;
   * otherwise, a new one will be created.
   *
   * @return {Dispatchers.Key}
   */
  public static getDispatcher(): Dispatchers.Key {
    let dispatcher: Key = (<any> document)[Key._DISPATCHER_KEY];
    if (dispatcher == null) {
      dispatcher = new Key();
      (<any> document)[Key._DISPATCHER_KEY] = dispatcher;
    }
    return dispatcher;
  }

  /**
   * This constructor should not be invoked directly.
   *
   * @constructor
   */
  constructor() {
    super();

    this._eventToProcessingFunction[Key._KEYDOWN_EVENT_NAME] = (e: KeyboardEvent) => this._processKeydown(e);
    this._eventToProcessingFunction[Key._KEYUP_EVENT_NAME] = (e: KeyboardEvent) => this._processKeyup(e);
  }

  private _processKeydown(event: KeyboardEvent) {
    this._callCallbacksForEvent(Key._KEYDOWN_EVENT_NAME, event.keyCode, event);
  }

  private _processKeyup(event: KeyboardEvent) {
    this._callCallbacksForEvent(Key._KEYUP_EVENT_NAME, event.keyCode, event);
  }

  /**
   * Registers a callback to be called whenever a key is pressed.
   *
   * @param {KeyCallback} callback
   * @return {Dispatchers.Key} The calling Key Dispatcher.
   */

  public onKeyDown(callback: KeyCallback): this {
    this._addCallbackForEvent(Key._KEYDOWN_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes the callback to be called whenever a key is pressed.
   *
   * @param {KeyCallback} callback
   * @return {Dispatchers.Key} The calling Key Dispatcher.
   */
  public offKeyDown(callback: KeyCallback): this {
    this._removeCallbackForEvent(Key._KEYDOWN_EVENT_NAME, callback);
    return this;
  }

  /** Registers a callback to be called whenever a key is released.
   *
   * @param {KeyCallback} callback
   * @return {Dispatchers.Key} The calling Key Dispatcher.
   */
  public onKeyUp(callback: KeyCallback): this {
    this._addCallbackForEvent(Key._KEYUP_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes the callback to be called whenever a key is released.
   *
   * @param {KeyCallback} callback
   * @return {Dispatchers.Key} The calling Key Dispatcher.
   */
  public offKeyUp(callback: KeyCallback): this {
    this._removeCallbackForEvent(Key._KEYUP_EVENT_NAME, callback);
    return this;
  }
}
