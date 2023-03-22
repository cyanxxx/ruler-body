import EventEmitter from "eventemitter3";

export const eventEmitter = new EventEmitter()

export enum Event{
  TouchStartEvent = 'TouchStartEvent',
  TouchEndEvent= 'TouchEndEvent',
  TouchMoveEvent= 'TouchMoveEvent',
  TapEvent = "TapEvent",
  ADDIMAGE = "AddImage",
  RESETCANVAS = "ResetCanvas"
}