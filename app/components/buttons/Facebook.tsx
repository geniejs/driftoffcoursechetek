import { ReactElement } from 'react';

export default function FacebookButton({
	text = 'Sign in with Facebook',
}): ReactElement {
	return (
		<div className="firebaseui-list-item">
			<div className="btn bg-[#3b5998]">
				<span className="firebaseui-idp-icon-wrapper">
					<img
						className="firebaseui-idp-icon"
						alt=""
						src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
					/>
				</span>
				<span className="firebaseui-idp-text firebaseui-idp-text-long">
					{text}
				</span>
				<span className="firebaseui-idp-text firebaseui-idp-text-short">
					Facebook
				</span>
			</div>
		</div>
	);
}
