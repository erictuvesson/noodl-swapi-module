import * as React from 'react';
import * as Noodl from '@noodl/noodl-sdk';

function autoLayoutComponent(props: any): any {
  let style: React.CSSProperties = {
    padding: props.padding,
    display: 'grid',
    gap: props.gap,
    width: '100%'
  };

  if (props.columns) {
    style.gridTemplateColumns = `repeat(${props.columns}, minmax(0, 1fr))`;
  }

  if (props.rows) {
    style.gridTemplateRows = `repeat(${props.rows}, minmax(0, 1fr))`;
  }

  return <div
    style={style as React.CSSProperties}
    onClick={props.onClick}
  >{props.children}</div>
}

export const autoLayoutComponentNode = Noodl.defineReactNode({
  name: 'Auto Layout',
  category: 'Visual',
  color: 'default',
  getReactComponent() {
    return autoLayoutComponent;
  },
  inputProps: {
    columns: {
      type: {
        name: 'number',
      },
      default: undefined
    },
    rows: {
      type: {
        name: 'number',
      },
      default: undefined
    },
    padding: {
      type: {
        name: 'number',
        units: ['px'],
        defaultUnit: 'px'
      },
      default: 0
    },
    gap: {
      name: 'Spacing between items',
      group: 'Auto Layout',
      type: {
        name: 'number',
        units: ['px'],
        defaultUnit: 'px'
      },
      default: 0
    }
  },
  outputProps: {
    onClick: { type: 'signal', displayName: 'Click' }
  }
});
