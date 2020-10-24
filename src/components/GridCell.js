import {h, Component, Fragment} from 'preact'
import classNames from 'classnames'

export default class GridCell extends Component {
  componentDidMount() {
    this.componentDidUpdate()
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.value !== this.props.value ||
      nextProps.edit !== this.props.edit ||
      nextProps.selected !== this.props.selected ||
      nextProps.moving !== this.props.moving ||
      nextProps.showBorder !== this.props.showBorder
    )
  }

  componentWillUpdate() {
    if (this.valueElement != null) {
      // Remove residual MathJax artifacts
      this.valueElement.innerHTML = ''
      MathJax.typesetClear([this.valueElement])
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.valueElement == null) return

    let {onTypesetFinish = () => {}} = this.props

    if (this.inputElement != null && prevProps.edit !== this.props.edit) {
      this.inputElement.select()
    }

    if (this.props.value) {
      await MathJax.typesetPromise([this.valueElement])
    }

    onTypesetFinish({
      position: this.props.position,
      element: !this.props.value
        ? null
        : this.valueElement.querySelector('mjx-container')
    })
  }

  submit = () => {
    let {onSubmit = () => {}} = this.props
    onSubmit({position: this.props.position})
  }

  handleGrabberPointerDown = evt => {
    let {onGrabberPointerDown = () => {}} = this.props

    evt.position = this.props.position
    onGrabberPointerDown(evt)
  }

  handleGrabberDragStart = evt => {
    evt.preventDefault()
  }

  handleEditSubmit = evt => {
    evt.preventDefault()
  }

  handleEditKeyDown = evt => {
    if (evt.key === 'Enter') {
      evt.stopPropagation()
      this.submit()
    }
  }

  handleInputBlur = evt => {
    this.submit()
  }

  stopPropagation = evt => {
    evt.stopPropagation()
  }

  handleInputChange = evt => {
    let {onChange = () => {}} = this.props

    onChange({
      position: this.props.position,
      value: evt.currentTarget.value
    })
  }

  handleAddLoop = evt => {
    let {onAddLoopClick = () => {}} = this.props

    onAddLoopClick(evt)
  }

  render() {
    return (
      <li
        class={classNames('grid-cell', {
          edit: this.props.edit,
          selected: this.props.selected,
          moving: this.props.moving,
          'show-border': this.props.showBorder
        })}
        data-position={this.props.position.join(',')}
      >
        <div class="value" ref={el => (this.valueElement = el)}>
          {this.props.value ? (
            `\\(${this.props.value}\\)`
          ) : (
            <span class="hide">_</span>
          )}
        </div>

        {this.props.edit && (
          <form class="edit" onSubmit={this.handleEditSubmit}>
            <input
              ref={el => (this.inputElement = el)}
              type="text"
              value={this.props.value}
              onBlur={this.handleInputBlur}
              onInput={this.handleInputChange}
              onPointerDown={this.stopPropagation}
              onKeyDown={this.handleEditKeyDown}
            />
          </form>
        )}

        {this.props.showBorder && (
          <>
            <img
              class="grabber"
              src="./img/grabber.svg"
              onPointerDown={this.handleGrabberPointerDown}
              onDragStart={this.handleGrabberDragStart}
            />

            <img
              class="loop"
              src="./img/loop.svg"
              title="Create Loop"
              alt="Create Loop"
              onClick={this.handleAddLoop}
            />
          </>
        )}
      </li>
    )
  }
}
