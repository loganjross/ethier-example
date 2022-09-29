import { useEthier } from '../contexts/ethier';
import { useWidget } from '../contexts/widget';

// Button to trigger interactions with main modal
export function EthierButton(props: { style?: React.CSSProperties }) {
  const { widgetOpen, toggleWidgetOpen } = useWidget();
  const { isLoggedIn } = useEthier();

  return (
    <button
      className={`ethier-btn brand-text flex-centered ${
        widgetOpen ? 'active' : ''
      }`}
      onClick={toggleWidgetOpen}
      style={props.style}
    >
      <span>Ethier</span>
      <i className={`fa-${isLoggedIn ? 'solid' : 'regular'} fa-user`}></i>
    </button>
  );
}
