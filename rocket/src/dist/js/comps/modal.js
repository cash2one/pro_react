'use strict';

/**
 * edit by lxt
 * 2016/07/22
 * 弹窗v2
 */

define(['mods'], function (mods) {
	var React = require('mods').ReactPack.default;

	var Modal = React.createClass({
		displayName: 'Modal',

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'modal fade', id: this.props.id || '' },
				React.createElement(
					'div',
					{ className: this.props.modalSm ? "modal-dialog modal-sm" : "modal-dialog" },
					React.createElement(
						'div',
						{ className: 'modal-content' },
						React.createElement(
							'div',
							{ className: this.props.noBtn ? "none" : "modal-header" },
							React.createElement(
								'button',
								{ type: 'button', className: this.props.warn || this.props.noClose ? "none" : "close", 'data-dismiss': 'modal' },
								React.createElement(
									'span',
									{ 'aria-hidden': 'true' },
									'×'
								)
							),
							React.createElement(
								'h4',
								{ className: 'modal-title' },
								this.props.title || ''
							)
						),
						React.createElement(
							'div',
							{ className: this.props.warn ? "none" : "modal-body" },
							this.props.children
						),
						React.createElement(
							'div',
							{ className: this.props.noBtn ? "none" : "modal-footer" },
							React.createElement(
								'button',
								{ type: 'button', className: this.props.warn || this.props.noDismiss ? "none" : "btn btn-default btn-lg", 'data-dismiss': !this.props.cancelEvent && "modal", onClick: this.props.cancelEvent && this.props.dismiss },
								'取消'
							),
							React.createElement(
								'button',
								{ type: 'button', className: 'btn btn-primary btn-lg', onClick: this.props.confirm },
								this.props.confirmTxt || '确认'
							)
						)
					)
				)
			);
		}
	});

	return Modal;
});

/**
 * 说明(eg)
 *
 * 定时隐藏弹窗：
 <Modal title="温馨提示" id="tipshow" noBtn modalSm>
	<div className="m-msg">
		<p>{this.state.tipTxt}</p>
	</div>
</Modal>

*警告框弹窗：
<Modal title="温馨提示" id="warn_modal" warn confirm={this.handleConfirm}>
	<p>{this.state.tipTxt}</p>
</Modal>
 */