const treeContainer = document.getElementById('tree');
const permissionBody = document.getElementById('permissionBody');
const folderTitle = document.getElementById('folderTitle');
const folderMeta = document.getElementById('folderMeta');
const errorMessage = document.getElementById('error');
const loadButton = document.getElementById('loadRoot');
const userIdInput = document.getElementById('userId');

let selectedNode = null;

function getHeaders() {
  const userId = userIdInput.value.trim();
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId
  };
}

function setError(message) {
  errorMessage.textContent = message || '';
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: getHeaders() });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

function clearTree() {
  treeContainer.innerHTML = '';
  folderTitle.textContent = 'Select a folder';
  folderMeta.textContent = '';
  permissionBody.innerHTML = '';
}

function renderPermissions(permissions) {
  permissionBody.innerHTML = '';
  permissions.forEach((permission) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${permission.name}</td>
      <td>${permission.email}</td>
      <td>${permission.role}</td>
      <td>${permission.level}</td>
    `;
    permissionBody.appendChild(row);
  });
}

async function handleSelectFolder(folder, nodeElement) {
  if (selectedNode) {
    selectedNode.classList.remove('selected');
  }
  selectedNode = nodeElement;
  selectedNode.classList.add('selected');
  folderTitle.textContent = folder.name;
  folderMeta.textContent = `Type: ${folder.type} · Folder ID: ${folder.folder_id}`;
  setError('');
  try {
    const permissions = await fetchJson(`/folders/${folder.folder_id}/permissions`);
    renderPermissions(permissions);
  } catch (error) {
    setError(error.message);
  }
}

async function loadChildren(folderId, container) {
  const children = await fetchJson(`/folders/${folderId}/children`);
  container.innerHTML = '';
  children.forEach((child) => {
    container.appendChild(createNode(child));
  });
}

function createNode(folder) {
  const wrapper = document.createElement('div');
  const node = document.createElement('div');
  node.className = 'tree-node';
  node.textContent = folder.name;
  const childrenContainer = document.createElement('div');
  childrenContainer.className = 'tree-children';
  childrenContainer.dataset.loaded = 'false';

  node.addEventListener('click', async (event) => {
    event.stopPropagation();
    handleSelectFolder(folder, node);
    if (childrenContainer.dataset.loaded === 'false') {
      try {
        await loadChildren(folder.folder_id, childrenContainer);
        childrenContainer.dataset.loaded = 'true';
      } catch (error) {
        setError(error.message);
      }
    } else {
      childrenContainer.classList.toggle('hidden');
    }
  });

  wrapper.appendChild(node);
  wrapper.appendChild(childrenContainer);
  return wrapper;
}

async function loadRoot() {
  setError('');
  clearTree();
  try {
    const root = await fetchJson('/folders/root');
    const rootNode = createNode(root);
    treeContainer.appendChild(rootNode);
    await handleSelectFolder(root, rootNode.querySelector('.tree-node'));
    await loadChildren(root.folder_id, rootNode.querySelector('.tree-children'));
    rootNode.querySelector('.tree-children').dataset.loaded = 'true';
  } catch (error) {
    setError(error.message);
  }
}

loadButton.addEventListener('click', () => {
  if (!userIdInput.value.trim()) {
    setError('Enter a user id before loading.');
    return;
  }
  loadRoot();
});
