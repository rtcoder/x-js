import {MixedObject} from './mixed-object.ts';

export type XInstanceData = {
  container: HTMLElement | string;
  data: MixedObject;
  methods?: MixedObject;
}
