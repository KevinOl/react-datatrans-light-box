import React, {Component} from 'react'
import PropTypes from 'prop-types'
import PaymentPageFrame from './PaymentPageFrame'
import {
  filterProps, toUrlParams, parseUrl,
  lockScrolling,
  releaseLock
} from './utils'

const rejectProps = [
  'production', 'onCancelled', 'onLoaded', 'onError', 'version'
]

const buildUrl = (props, production) => production
? 'https://payment.datatrans.biz/upp/jsp/upStart.jsp?' + toUrlParams(props)
: 'https://pilot.datatrans.biz/upp/jsp/upStart.jsp?' + toUrlParams(props)

const hasError = ev => typeof ev.data !== typeof undefined && ev.data.type === 'error'

export default class LightBox extends Component {

  constructor(props) {
    super(props)

    this.boundOnMessage = this.onMessage.bind(this)
    this.boundOnCancelled = this.onCancelled.bind(this)

    lockScrolling()

    const urlParams = filterProps(this.props, rejectProps)
    this.url = buildUrl(urlParams, this.props.production)
    this.origin = parseUrl(this.url).origin

    this.state = { visible: true}
  }

  onMessage(ev) {
    
    window.console.log('xxxxx on message', ev, this)
    
    if(ev.origin !== this.origin) return
    if(ev.data === 'cancel') return this.boundOnCancelled()
    if(ev.data === 'frameReady') return this.props.onLoaded()
    if(hasError(ev)) return this.props.onError(ev.data)
  }

  onCancelled() {
    window.console.log('xxxxx on cancelled')
    this.setState({visible: false})
    releaseLock()
    this.props.onCancelled()
  }

  componentDidMount() {
    window.console.log('xxxxx component did mount')
    const addListener = window.addEventListener || window.attachEvent
    addListener('message', this.boundOnMessage)
  }

  componentWillUnmount() {
    window.console.log('xxxxx component will unmount')
    const removeListener = window.removeEventListener || window.detachEvent
    removeListener('message', this.boundOnMessage)
    releaseLock()
  }

  render() {

    if(!this.state.visible) return <div> do not render me </div>

    return <PaymentPageFrame
      url={this.url}
      showsPaymentPage={this.props.showsPaymentPage}
    />
  }

}

LightBox.propTypes = {
  merchantId: PropTypes.string.isRequired,
  refno: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  sign: PropTypes.string.isRequired,

  production: PropTypes.bool,
  showsPaymentPage: PropTypes.bool.isRequired,

  onCancelled: PropTypes.func.isRequired,
  onLoaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,

}

LightBox.defaultProps = {
  onCancelled() {},
  onLoaded() {},
  onError() {},
  production: false,
  theme: 'DT2015',
  version: '1.0.2',
  showsPaymentPage: true,
}
