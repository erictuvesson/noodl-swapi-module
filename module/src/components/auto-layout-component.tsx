import * as React from 'react';
import * as Noodl from '@noodl/noodl-sdk';

function autoLayoutComponent(props: any): any {
  let style: React.CSSProperties = {
    padding: props.padding,
    display: 'grid',
    gap: props.gap,
    width: '100%'
  };

  const wrapAfter = !Number.isNaN(Number(props.wrapAfter)) ? props.wrapAfter : 'auto-fit';
  if (props.direction === 'horizontal') {
    style.gridTemplateColumns = `repeat(${wrapAfter}, minmax(0, 1fr))`;
  } else {
    style.gridTemplateRows = `repeat(${wrapAfter}, minmax(0, 1fr))`;
  }

  return <div
    style={style as React.CSSProperties}
    onClick={props.onClick}
  >{props.children}</div>
}

/**
 * This is inspired by Figma Auto Layout
 */
export const autoLayoutComponentNode = Noodl.defineReactNode({
  name: 'Auto Layout',
  category: 'Extra Visual',
  getReactComponent() {
    return autoLayoutComponent;
  },
  inputProps: {
    padding: {
      group: 'Auto Layout',
      displayName: 'Padding',
      type: {
        name: 'number',
        units: ['px'],
        defaultUnit: 'px'
      },
      default: 0,
    },
    direction: {
      group: 'Auto Layout',
      displayName: 'Direction',
      default: 'vertical',
      type: {
        name: 'enum',
        enums: [
          {
            label: 'Vertical',
            value: 'vertical'
          },
          {
            label: 'Horizontal',
            value: 'horizontal'
          }
        ]
      },
      transformTo: (value: string): string => {
        return value;
      }
    },
    wrapAfter: {
      group: 'Auto Layout Advanced',
      displayName: 'Wrap children every',
      type: {
        name: 'number',
      },
      default: undefined,
      transformTo: (value: string): string => {
        // clamp the value to minimum 0
        return Math.max(Number(value), 0).toString();
      }
    },
    gap: {
      group: 'Auto Layout',
      displayName: 'Spacing between items',
      type: {
        name: 'number',
        units: ['px'],
        defaultUnit: 'px'
      },
      default: 0
    }
  }
});
