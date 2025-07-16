let debounceTimer = null;

function isSolanaAddress(text) {
	return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text);
}

function isSolanaSignature(text) {
	return /^[1-9A-HJ-NP-Za-km-z]{80,88}$/.test(text);
}

function getSelectionText() {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return null;

	const text = selection.toString().trim();
	if (!text) return null;

	const range = selection.getRangeAt(0);
	const rect = range.getBoundingClientRect();

	// Only show for visible selections (not collapsed or in invisible elements)
	if (rect.width === 0 && rect.height === 0) return null;

	// Ignore selections in form elements
	const anchorNode = selection.anchorNode;
	if (anchorNode) {
		const parentEl = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;
		if (parentEl && ['INPUT', 'TEXTAREA'].includes(parentEl.tagName)) return null;
	}

	return { text, rect };
}

function createTooltip(text, rect) {
	removeTooltip();

	const tooltip = document.createElement('div');
	tooltip.className = 'solana-tooltip';

	let content = '';

	if (isSolanaAddress(text)) {
		content = `
    <a href="https://explorer.solana.com/address/${text}" target="_blank"><img class="tooltip-img" title="Explorer" alt="Explorer" src="${chrome.runtime.getURL('icons/explorer.png')}"/></a>
    <a href="https://solscan.io/account/${text}" target="_blank"><img class="tooltip-img" title="SolScan" alt="SolScan" src="${chrome.runtime.getURL('icons/solscan.png')}"/></a>
    <a href="https://explorer.fogo.io/address/${text}" target="_blank"><img class="tooltip-img" title="FogoScan" alt="FogoScan" src="${chrome.runtime.getURL('icons/fogo.png')}"/></a>
  `;
	} else if (isSolanaSignature(text)) {
		content = `
    <a href="https://explorer.solana.com/tx/${text}" target="_blank"><img class="tooltip-img" title="Explorer" alt="Explorer" src="${chrome.runtime.getURL('icons/explorer.png')}"/></a>
    <a href="https://solscan.io/tx/${text}" target="_blank"><img class="tooltip-img" title="SolScan" alt="SolScan" src="${chrome.runtime.getURL('icons/solscan.png')}"/></a>
    <a href="https://explorer.fogo.io/transaction/${text}" target="_blank"><img class="tooltip-img" title="FogoScan" alt="FogoScan" src="${chrome.runtime.getURL('icons/fogo.png')}"/></a>
  `;
	}


	if (!content) return;

	tooltip.innerHTML = content;
	tooltip.style.left = `${window.scrollX + rect.left + 10}px`;
	tooltip.style.top = `${window.scrollY + rect.bottom + 10}px`;

	document.body.appendChild(tooltip);
}

function removeTooltip() {
	document.querySelectorAll('.solana-tooltip').forEach(el => el.remove());
}

document.addEventListener('selectionchange', () => {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		const selection = getSelectionText();
		if (!selection) {
			removeTooltip();
			return;
		}

		const { text, rect } = selection;

		if (isSolanaAddress(text) || isSolanaSignature(text)) {
			createTooltip(text, rect);
		} else {
			removeTooltip();
		}
	}, 100);
});

document.addEventListener('click', (e) => {
	if (!e.target.closest('.solana-tooltip')) {
		removeTooltip();
	}
});
