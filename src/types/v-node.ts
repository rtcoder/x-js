import {MixedObject} from './mixed-object.ts';

export interface VNode {
  type: string;
  props: MixedObject;
  content: string|null;
  children: VNode[];
}
