import { describe, expect, it } from 'vitest'
import { makeVueComponent } from './index';

describe('makeVueComponent', () => {
  it('wraps an icon string as a Vue component', () => {
    const iconString = '<svg>...</svg>';
    const component = makeVueComponent(iconString);
    expect(component.type).toBe('span');
    expect(component.props?.innerHTML).toBe(iconString.replace(/"/g, "'"));
  });
});