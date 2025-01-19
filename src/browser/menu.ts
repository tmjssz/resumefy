export const menu = (openPreview: () => void) => () => {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.bottom = '1rem'
  container.style.right = '1rem'

  const button = document.createElement('button')
  button.textContent = 'PDF'
  button.style.cursor = 'pointer'
  button.title = 'Open PDF preview in a new tab'
  button.onclick = openPreview
  container.appendChild(button)

  document.body.appendChild(container)
}
