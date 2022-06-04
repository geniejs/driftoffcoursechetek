import type { PropsWithChildren, ReactElement } from 'react';
import { IoClose } from 'react-icons/io5';
import Button from './Button';

type ModalProps = {
	id: string;
};

export default function Modal({
	id,
	children,
}: PropsWithChildren<ModalProps>): ReactElement {
	return (
		<div className="bg-primary text-primary-content">
			<input type="checkbox" id={id} className="modal-toggle" />
			<label htmlFor={id} className="modal cursor-pointer">
				<label
					className="modal-box relative max-w-screen-2xl bg-primary text-primary-content "
					htmlFor=""
				>
					<Button className=" sticky left-full top-2" circle size="sm">
						<label
							className="flex h-full w-full cursor-pointer items-center justify-center"
							htmlFor={id}
						>
							<IoClose size={20} />
						</label>
					</Button>

					{children}
				</label>
			</label>
		</div>
	);
}
