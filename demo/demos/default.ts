export const route = "default";
export const title = "Plottable";
export function render(el: HTMLElement) {
    const root = document.createElement("div");
    root.innerHTML = `
        <h1>Plottable Demo Page</h1>
        <p>Select a demo from the nav bar</p>
    `;
    el.appendChild(root);
};
