import { ReactElement } from 'react';

export default function FacebookButton({
	text = 'Sign in with Google',
}): ReactElement {
	return (
		<div className="firebaseui-list-item">
			<div className="btn bg-white ">
				<span className="firebaseui-idp-icon-wrapper">
					<img
						className="firebaseui-idp-icon"
						alt=""
						src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
					/>
				</span>
				<span className="firebaseui-idp-text firebaseui-idp-text-long !text-gray-600	">
					{text}
				</span>
				<span className="firebaseui-idp-text firebaseui-idp-text-short !text-gray-600	">
					Google
				</span>
			</div>
		</div>
	);
}
