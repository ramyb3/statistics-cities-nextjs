import { atom } from "jotai";
import { MailTemplate } from "./utils";

export const allDataAtom = atom<any>([]);
export const apiDataAtom = atom<any>([]);
export const comparedAtom = atom<any>([]);
export const searchAtom = atom<string>("");
export const mailTextAtom = atom<MailTemplate | null>(null);
export const displayAtom = atom<boolean>(true);
export const tooltipAtom = atom<any>({
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
  step6: false,
});
