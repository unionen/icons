/* eslint-disable quotes */
import * as icons from "./icons-single";
export * from "./collections";
import { h } from "vue";
import unionenIcons from "./unionenIcons";

export default icons;
export { icons, unionenIcons };

/**
 * Simple function that replaces all double quotes with single quotes in a given string
 * @param param - The string to replace
 * @public
 */
export function singleQuotes(param: string): string {
  return param.replace(/"/g, "'");
}
/**
 * Simple function that wraps an icon string as a Vue component
 * @param param - The icon string to wrap
 * @public
 */
export function makeVueComponent(
  param: string,
  size: "sm" | "md" | "lg" | undefined = undefined,
  hide: boolean = true
) {
  return h("span", {
    innerHTML: singleQuotes(param),
    class: size ? `icon-${size}` : undefined,
    "aria-hidden": hide ? "true" : undefined,
  });
}

