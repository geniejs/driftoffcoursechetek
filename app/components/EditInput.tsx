import { BsPencilSquare } from 'react-icons/bs';
import { IoCloseSharp, IoSaveSharp } from 'react-icons/io5';
import classNames from 'classnames';
import { Grid } from 'react-loading-icons';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { useMountEffect } from '~/lib/react/hooks';

interface EditInput {
	editFunction: (val: string) => void | Promise<void>;
	onSuccess?: () => void;
	onError?: (error: any, label: string) => Promise<void>;
	onEnterEdit?: () => void;
	label: string;
	value?: string;
	updating: boolean;
	error: any;
	editMode?: boolean;
	btnId?: string;
	hideSave?: boolean;
	setSuccess?: boolean;
	inputRef?: React.RefObject<HTMLInputElement>;
}

export default function EditInputComp({
	value = '',
	editMode = false,
	editFunction,
	label,
	updating: inputUpdating,
	error: inputError,
	onSuccess,
	onEnterEdit = () => {},
	onError,
	btnId,
	hideSave = false,
	setSuccess: setSuccessManually = false,
	inputRef,
}: EditInput) {
	const [val, setVal] = useState(value);
	const [readOnly, setReadOnly] = useState(true);
	const [error, setError] = useState<any>();
	const [updating, setUpdating] = useState(false);
	const [success, setSuccess] = useState(false);
	const [successSent, setSuccessSent] = useState(false);
	const [hasUpdated, setHasUpdated] = useState(false);
	const inputClasses = classNames('input input-bordered grow', {
		'input-warning': !readOnly && !updating && !success && !inputUpdating,
		'input-info': updating || inputUpdating,
		'input-error': error,
		'input-success': !error && !updating && success && !inputUpdating,
	});
	inputRef = inputRef || React.createRef<HTMLInputElement>();
	useEffect(() => {
		if (success && onSuccess && !successSent) {
			setSuccessSent(true);
			onSuccess();
			setError(undefined);
		}
		if (success) {
			setReadOnly(true);
		}
	}, [success, onSuccess, successSent]);

	useEffect(() => {
		if (setSuccessManually) {
			setSuccess(true);
		}
	}, [setSuccessManually]);
	useEffect(() => {
		setVal(value);
	}, [value]);
	useEffect(() => {
		setError(inputError);
	}, [inputError]);
	useEffect(() => {
		if (inputUpdating || updating) {
			setHasUpdated(true);
		}
		if (hasUpdated && !inputUpdating && !updating && !error && !inputError) {
			setSuccess(true);
		}
	}, [inputUpdating, inputError, error, updating, hasUpdated]);

	const enterEditMode = useCallback(() => {
		setReadOnly(false);
		setSuccess(false);
		setSuccessSent(false);
		onEnterEdit();
		!hideSave && inputRef?.current?.focus();
	}, [hideSave, inputRef, onEnterEdit]);
	useMountEffect(() => {
		if (editMode) {
			enterEditMode();
		}
	});
	const save = useCallback(async () => {
		try {
			setUpdating(true);
			if (val) {
				await editFunction(val);
			}
		} catch (e) {
			setError(e);
		}
		setUpdating(false);
	}, [val, editFunction]);
	useEffect(() => {
		if (error && onError) {
			onError(error, label)
				.then(() => {
					save();
				})
				.catch(() => {});
		}
	}, [error, onError, save, label]);
	return (
		<div className="form-control w-full">
			<label className="input-group ">
				{label && <span>{label}</span>}
				<input
					ref={inputRef}
					value={val || ''}
					type="text"
					placeholder={label}
					readOnly={readOnly}
					className={inputClasses}
					onChange={(e) => setVal(e.target.value)}
				/>
				{!hideSave && !readOnly && !updating && !inputUpdating && (
					<button
						onClick={() => {
							if (!updating && !inputUpdating) {
								setReadOnly(true);
								setSuccess(false);
								setSuccessSent(false);
								setError(false);
								setVal(value);
							}
						}}
						className="inputClear btn btn-ghost  absolute right-16 text-xl"
					>
						<IoCloseSharp className="!rounded-none" />
					</button>
				)}

				{!inputUpdating && !updating && readOnly && !hideSave && (
					<button onClick={enterEditMode} className={`btn z-10 text-xl`}>
						<BsPencilSquare className="!rounded-none" />
					</button>
				)}
				{!inputUpdating && !updating && !readOnly && !hideSave && (
					<button id={btnId} onClick={save} className={`btn z-10 text-xl`}>
						<IoSaveSharp className="!rounded-none" />
					</button>
				)}
				{(inputUpdating || updating) && (
					<div className={`btn z-10 text-2xl`}>
						<Grid
							className="!rounded-none"
							stroke="currentColor"
							fill="currentColor"
							height="1em"
							width="1em"
						/>
					</div>
				)}
			</label>
		</div>
	);
}
