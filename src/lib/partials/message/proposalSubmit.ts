/** Create a submit runner for proposal panels. Handles submitting flag, activeAction reset, and error logging. */
export function createProposalSubmit(options: {
	getSubmitting: () => boolean;
	setSubmitting: (v: boolean) => void;
	setActiveAction: (v: null) => void;
}) {
	return function submit(promise: Promise<unknown>, label: string, onSuccess?: () => void) {
		if (options.getSubmitting()) return;
		options.setSubmitting(true);
		promise
			.then(() => {
				options.setActiveAction(null);
				onSuccess?.();
			})
			.catch((err) => console.error(`${label} failed:`, err))
			.finally(() => options.setSubmitting(false));
	};
}
