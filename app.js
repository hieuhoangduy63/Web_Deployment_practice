const API_URL = 'http://localhost:3000/users';

// Khai báo biến mảng chứa dữ liệu danh sách người dùng
let users = [];

// Khởi chạy khi load trang: gọi hàm fetchUsers
document.addEventListener('DOMContentLoaded', fetchUsers);

// READ: Lấy danh sách user từ API
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        users = await response.json(); // Lấy đúng 100% dữ liệu gốc từ API
        
        renderTable(users); // Hiển thị ra bảng
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
}

// Hàm vẽ dữ liệu ra bảng HTML
function renderTable(dataToRender) {
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = ''; // Xóa dữ liệu cũ

    dataToRender.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <button onclick="editUser(${user.id})">Sửa</button>
                <button onclick="deleteUser(${user.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// CREATE: Thêm user mới
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Tránh reload trang khi ấn submit

    // Lấy dữ liệu từ input
    const newUser = {
        name: document.getElementById('nameInput').value,
        email: document.getElementById('emailInput').value,
        phone: document.getElementById('phoneInput').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        const createdUser = await response.json();
        
        // Vì đây là API giả (trả về ID = 11), ta đổi ID sang số ngẫu nhiên để UI nhìn hợp lý
        if (createdUser.id === 11) {
            createdUser.id = Math.floor(Math.random() * 1000) + 11;
        }

        // Thêm vào mảng local và vẽ lại bảng
        users.push(createdUser);
        
        // Giữ lại bộ lọc tìm kiếm (nếu đang tìm kiếm)
        filterUsers(); 
        
        document.getElementById('addForm').reset(); // Xóa trắng form
        alert('Thêm thành công!');
    } catch (error) {
        console.error('Lỗi thêm dữ liệu:', error);
    }
});

// UPDATE: Sửa user
async function editUser(id) {
    // Tìm user đang cần sửa
    const userToEdit = users.find(u => u.id === id);
    if (!userToEdit) return;

    // Dùng hàm prompt mặc định của trình duyệt cho đơn giản
    const newName = prompt('Sửa tên:', userToEdit.name);
    const newEmail = prompt('Sửa email:', userToEdit.email);
    const newPhone = prompt('Sửa số điện thoại:', userToEdit.phone);

    // Nếu người dùng ấn Cancel (Hủy) thì thoát
    if (newName === null || newEmail === null || newPhone === null) return;

    const updatedData = {
        name: newName,
        email: newEmail,
        phone: newPhone
    };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        // Cập nhật lại mảng local
        users = users.map(user => {
            if (user.id === id) {
                return { ...user, ...updatedData };
            }
            return user;
        });

        // Vẽ lại bảng
        filterUsers();
        alert('Sửa thành công!');
    } catch (error) {
        console.error('Lỗi khi sửa dữ liệu:', error);
    }
}

// DELETE: Xóa user
async function deleteUser(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        // Lọc bỏ user đã xóa khỏi mảng
        users = users.filter(user => user.id !== id);
        
        // Vẽ lại bảng
        filterUsers();
        alert('Xóa thành công!');
    } catch (error) {
        console.error('Lỗi khi xóa dữ liệu:', error);
    }
}

// SEARCH: Tìm kiếm theo tên
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', filterUsers);

function filterUsers() {
    const keyword = searchInput.value.toLowerCase();
    
    // Nếu có từ khóa thì lọc, không thì lấy toàn bộ
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(keyword)
    );
    
    renderTable(filteredUsers);
}
