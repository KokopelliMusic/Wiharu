import React from 'react'

import './Wheel.css'

type WheelProps = {
  items: string[]
  timeout: number
}

type WheelState = {
  selectedItem: number | null
}

export default class Wheel extends React.Component<WheelProps, WheelState> {

  state = {
    selectedItem: 0
  }

  constructor(props: WheelProps) {
    super(props)
    this.selectItem = this.selectItem.bind(this)
    setTimeout(this.selectItem, props.timeout)
  }

  selectItem() {
    if (this.state.selectedItem === null) {
      const selectedItem = Math.floor(Math.random() * this.props.items.length)
      this.setState({ selectedItem })
    } else {
      this.setState({ selectedItem: null })
      setTimeout(this.selectItem, 500)
    }
  }

  render() {
    const { selectedItem } = this.state
    const { items } = this.props

    const wheelVars = {
      '--nb-item': items.length,
      '--selected-item': selectedItem,
    }
    const spinning = selectedItem !== null ? 'spinning' : ''

    return (
      <div className="wheel-container">
        {/* @ts-expect-error hou je bek ts pt 1999999 */}
        <div className={`wheel ${spinning}`} style={wheelVars}>
          {items.map((item, index) => (
            // @ts-expect-error hou je bek ts pt 2000000
            <div className="wheel-item" key={index} style={{ '--item-nb': index }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
