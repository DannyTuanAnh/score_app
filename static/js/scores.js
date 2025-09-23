// JavaScript for Scores page

let currentData = {};
let editingCache = {}; // Cache RAM cho các thay đổi chưa lưu
let hasUnsavedChanges = false;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  initializeScoresPage();
});

function initializeScoresPage() {
  const searchForm = document.getElementById("searchForm");
  const classIdInput = document.getElementById("classId");

  const searchStudent = document.getElementById("searchStudent");
  const studentIdInput = document.getElementById("studentId");

  if (searchStudent) {
    searchStudent.addEventListener("submit", handleStudentSearch);
  }
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearch);
  }

  // Auto search on Enter key
  if (classIdInput) {
    classIdInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch(e);
      }
    });
    // Focus on class ID input
    classIdInput.focus();
  }

  // Auto search student on Enter key
  if (studentIdInput) {
    studentIdInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleStudentSearch(e);
      }
    });
  }

  console.log("Scores page initialized");
}

async function handleStudentSearch(e) {
  e.preventDefault();

  const studentId = document.getElementById("studentId").value.trim();

  if (!studentId) {
    Utils.showError("Vui lòng nhập mã học sinh");
    return;
  }

  // Kiểm tra xem có dữ liệu lớp học chưa
  if (Object.keys(currentData).length === 0) {
    Utils.showError("Vui lòng tìm kiếm lớp học trước");
    return;
  }

  console.log(`Searching for student: ${studentId} in cache`);

  // Tìm kiếm nhanh trong dict
  const student = editingCache[studentId];

  if (student) {
    // Tìm thấy học sinh - chỉ hiển thị mỗi học sinh này
    displaySingleStudent(student);
    Utils.showSuccess(
      `Tìm thấy học sinh ${student.name || studentId} - điểm: ${student.score}`
    );
  } else {
    // Không tìm thấy - hiển thị lại toàn bộ danh sách
    displayResults(Object.values(editingCache));
    Utils.showError(
      `Không tìm thấy học sinh có mã "${studentId}" trong lớp này`
    );
  }
}

function displaySingleStudent(student) {
  const tableBody = document.getElementById("scoresTableBody");
  const totalRecords = document.getElementById("totalRecords");

  if (!tableBody || !totalRecords) {
    console.error("Required elements not found");
    return;
  }

  // Clear existing data
  tableBody.innerHTML = "";

  // Hiển thị chỉ một học sinh
  const row = createTableRow(student, 0);
  tableBody.appendChild(row);

  // Update total count với nút "Hiển thị tất cả"
  totalRecords.innerHTML = `1 (đang lọc) 
    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="showAllStudents()">
      <i class="fas fa-list"></i> Hiển thị tất cả
    </button>`;

  // Show results container
  Utils.showElement("resultsContainer");

  // Show save button if có thay đổi
  updateSaveButtonVisibility();

  console.log(`Displayed single student: ${student.studentID}`);
}

function showAllStudents() {
  // Hiển thị lại toàn bộ danh sách
  displayResults(Object.values(editingCache));

  // Clear input
  const studentIdInput = document.getElementById("studentId");
  if (studentIdInput) {
    studentIdInput.value = "";
  }

  Utils.showSuccess("Đã hiển thị lại toàn bộ danh sách");
}

async function handleSearch(e) {
  e.preventDefault();

  const classId = document.getElementById("classId").value.trim();

  if (!classId) {
    Utils.showError("Vui lòng nhập mã lớp");
    return;
  }

  // Clear previous results
  clearAllResults();

  // Show loading
  Utils.showLoading("loadingSpinner");

  try {
    console.log(`Searching scores for class: ${classId}`);

    // Call API
    const data = await API.getScoresByClass(classId);

    // Hide loading
    Utils.hideLoading("loadingSpinner");

    if (data && data.length > 0) {
      currentData = {};
      data.forEach((d) => {
        currentData[d.studentID] = { ...d };
      });
      console.log("Fetched data:", currentData);
      // Reset editing cache với dữ liệu mới
      editingCache = {};
      data.forEach((record) => {
        editingCache[record.studentID] = { ...record };
      });
      hasUnsavedChanges = false;

      displayResults(data);
      Utils.showSuccess(
        `Tìm thấy ${data.length} học sinh trong lớp ${classId}`
      );
    } else {
      Utils.showElement("noResults");
      console.log("No results found");
    }
  } catch (error) {
    console.error("Search error:", error);
    Utils.hideLoading("loadingSpinner");

    let errorMessage = "Không thể tải dữ liệu điểm. ";

    if (error.message.includes("404")) {
      errorMessage += "Không tìm thấy lớp học này.";
    } else if (error.message.includes("500")) {
      errorMessage += "Lỗi máy chủ, vui lòng thử lại sau.";
    } else {
      errorMessage += "Vui lòng kiểm tra kết nối mạng và thử lại.";
    }

    Utils.showError(errorMessage);
  }
}

function displayResults(data) {
  const tableBody = document.getElementById("scoresTableBody");
  const totalRecords = document.getElementById("totalRecords");

  if (!tableBody || !totalRecords) {
    console.error("Required elements not found");
    return;
  }

  // Clear existing data
  tableBody.innerHTML = "";

  // Populate table với dữ liệu từ editingCache
  Object.values(editingCache).forEach((record, index) => {
    const row = createTableRow(record, index);
    tableBody.appendChild(row);
  });

  // Update total count
  totalRecords.textContent = Object.keys(editingCache).length;

  // Show results container
  Utils.showElement("resultsContainer");

  // Show save button if có thay đổi
  updateSaveButtonVisibility();

  console.log(`Displayed ${Object.keys(editingCache).length} records`);
}

function createTableRow(record, index) {
  const row = document.createElement("tr");
  row.className = "table-row";
  row.id = `row-${record.studentID}`;

  // Add row animation delay
  row.style.animationDelay = `${index * 10}ms`;
  row.classList.add("fade-in");

  // Kiểm tra xem có đang edit không
  const isEditing = row.classList.contains("editing-mode");

  // Kiểm tra xem có thay đổi không
  const originalRecord = currentData[record.studentID];
  const hasChanges = originalRecord && originalRecord.score !== record.score;

  row.innerHTML = `
        <td>
            <strong>${escapeHtml(record.studentID || "N/A")}</strong>
        </td>
        <td>
            <span data-name='${record.name}' >
                <i class="fas fa-user text-muted me-1"></i>
                ${escapeHtml(record.name || "Chưa có tên")}
            </span>
        </td>
        <td class="editable-score" data-field="score">
            <span class="display-mode">
                ${Utils.formatScore(record.score || 0)}
            </span>
            <input type="number" class="form-control edit-mode d-none" 
                   min="0" max="10" step="0.1"
                   value="${record.score || 0}" 
                   data-original="${record.score || 0}">
        </td>
        <td>
            <i class="fas fa-calendar text-muted me-1"></i>
            <small>${Utils.formatDate(record.date_update)}</small>
        </td>
        <td>
            <span class="badge bg-secondary">v${record.version || 1}</span>
        </td>
        <td class="action-buttons">
            <button class="btn btn-sm btn-primary edit-btn" onclick="toggleEditMode('${
              record.studentID
            }')">
                <i class="fas fa-edit"></i> Sửa điểm
            </button>
            <button class="btn btn-sm btn-success save-btn d-none" onclick="saveRowEdit('${
              record.studentID
            }')">
                <i class="fas fa-check"></i> Lưu
            </button>
            <button class="btn btn-sm btn-secondary cancel-btn d-none" onclick="cancelRowEdit('${
              record.studentID
            }')">
                <i class="fas fa-times"></i> Hủy
            </button>
            ${
              hasChanges
                ? '<span class="badge bg-warning ms-1">Đã sửa</span>'
                : ""
            }
        </td>
    `;

  return row;
}

function selectRow(row) {
  // Remove previous selection
  const previouslySelected = document.querySelector(".table-row.table-active");
  if (previouslySelected) {
    previouslySelected.classList.remove("table-active");
  }

  // Add selection to current row
  row.classList.add("table-active");
}

// Chức năng chỉnh sửa inline
function toggleEditMode(studentID) {
  const row = document.getElementById(`row-${studentID}`);
  if (!row) return;

  const isEditing = row.classList.contains("editing-mode");

  if (isEditing) {
    // Đang edit -> chuyển về display mode
    exitEditMode(studentID);
  } else {
    // Chuyển sang edit mode
    enterEditMode(studentID);
  }
}

function enterEditMode(studentID) {
  const row = document.getElementById(`row-${studentID}`);
  if (!row) return;

  row.classList.add("editing-mode");

  // Ẩn display mode, hiện edit mode
  row
    .querySelectorAll(".display-mode")
    .forEach((el) => el.classList.add("d-none"));
  row
    .querySelectorAll(".edit-mode")
    .forEach((el) => el.classList.remove("d-none"));

  // Ẩn nút Edit, hiện nút Save/Cancel
  row.querySelector(".edit-btn").classList.add("d-none");
  row.querySelector(".save-btn").classList.remove("d-none");
  row.querySelector(".cancel-btn").classList.remove("d-none");

  // Focus vào input đầu tiên
  const firstInput = row.querySelector(".edit-mode");
  if (firstInput) firstInput.focus();
}

function exitEditMode(studentID) {
  const row = document.getElementById(`row-${studentID}`);
  if (!row) return;

  row.classList.remove("editing-mode");

  // Hiện display mode, ẩn edit mode
  row
    .querySelectorAll(".display-mode")
    .forEach((el) => el.classList.remove("d-none"));
  row
    .querySelectorAll(".edit-mode")
    .forEach((el) => el.classList.add("d-none"));

  // Hiện nút Edit, ẩn nút Save/Cancel
  row.querySelector(".edit-btn").classList.remove("d-none");
  row.querySelector(".save-btn").classList.add("d-none");
  row.querySelector(".cancel-btn").classList.add("d-none");
}

function saveRowEdit(studentID) {
  const row = document.getElementById(`row-${studentID}`);
  if (!row) return;

  // Lấy giá trị mới từ input
  const scoreInput = row.querySelector('[data-field="score"] .edit-mode');

  const newScore = parseFloat(scoreInput.value);

  // Validation

  if (isNaN(newScore) || newScore < 0 || newScore > 10) {
    Utils.showError("Điểm phải là số từ 0 đến 10");
    scoreInput.focus();
    return;
  }

  // Cập nhật vào editingCache (RAM)
  if (editingCache[studentID]) {
    editingCache[studentID].score = newScore;
    editingCache[studentID].date_update = new Date().toISOString();

    // Đánh dấu có thay đổi
    hasUnsavedChanges = true;
  }

  // Cập nhật display
  const scoreDisplay = row.querySelector('[data-field="score"] .display-mode');
  const studentNameElement = row.querySelector("[data-name]");
  const studentName = studentNameElement
    ? studentNameElement.textContent.trim()
    : editingCache[studentID]?.name || studentID;

  scoreDisplay.innerHTML = Utils.formatScore(newScore);

  // Exit edit mode
  exitEditMode(studentID);

  // Update save button visibility
  updateSaveButtonVisibility();

  Utils.showSuccess(
    `Đã cập nhật thông tin của học sinh ${studentName} trong bộ nhớ`
  );

  console.log(`Updated ${studentID} in cache:`, editingCache[studentID]);
}

function cancelRowEdit(studentID) {
  const row = document.getElementById(`row-${studentID}`);
  if (!row) return;

  // Reset input values về giá trị gốc
  const scoreInput = row.querySelector('[data-field="score"] .edit-mode');

  scoreInput.value = scoreInput.dataset.original;

  // Exit edit mode
  exitEditMode(studentID);
}

function updateSaveButtonVisibility() {
  // Kiểm tra xem có thay đổi nào không
  const changes = getChangesFromCache();

  // Tìm hoặc tạo save button container
  let saveContainer = document.getElementById("saveChangesContainer");

  if (changes.length > 0 && !saveContainer) {
    // Tạo save button container
    saveContainer = document.createElement("div");
    saveContainer.id = "saveChangesContainer";
    saveContainer.className = "alert alert-warning mt-3";
    saveContainer.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Có ${changes.length} thay đổi chưa lưu!</strong>
          <small class="d-block">Dữ liệu chỉ được lưu trong bộ nhớ. Bấm "Lưu tất cả" để gửi lên server.</small>
        </div>
        <div>
          <button class="btn btn-success me-2" onclick="saveAllChanges()">
            <i class="fas fa-save"></i> Lưu tất cả (${changes.length})
          </button>
          <button class="btn btn-outline-secondary" onclick="discardAllChanges()">
            <i class="fas fa-undo"></i> Hủy tất cả
          </button>
        </div>
      </div>
    `;

    // Thêm vào sau results container
    const resultsContainer = document.getElementById("resultsContainer");
    if (resultsContainer) {
      resultsContainer.parentNode.insertBefore(saveContainer, resultsContainer);
    }
  } else if (changes.length === 0 && saveContainer) {
    // Xóa save button nếu không có thay đổi
    saveContainer.remove();
  } else if (changes.length > 0 && saveContainer) {
    // Cập nhật số lượng thay đổi
    saveContainer.querySelector(
      "strong"
    ).textContent = `Có ${changes.length} thay đổi chưa lưu!`;
    saveContainer.querySelector(
      ".btn-success"
    ).innerHTML = `<i class="fas fa-save"></i> Lưu tất cả (${changes.length})`;
  }
}

function getChangesFromCache() {
  const changes = [];

  Object.values(editingCache).forEach((cached) => {
    const original = currentData[cached.studentID];
    if (original && original.score !== cached.score) {
      changes.push({
        studentID: cached.studentID,
        score: cached.score,
        version: cached.version,
      });
    }
  });

  return changes;
}

async function saveAllChanges() {
  const changes = getChangesFromCache();

  if (changes.length === 0) {
    Utils.showError("Không có thay đổi nào để lưu");
    return;
  }

  // Hiện loading
  const saveBtn = document.querySelector("#saveChangesContainer .btn-success");
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
  saveBtn.disabled = true;

  try {
    console.log("Saving changes:", changes);

    // Gửi đến API
    const results = await API.batchUpdateScores(changes);

    if (results && Array.isArray(results)) {
      await processUpdateResults(results);
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Save error:", error);
    Utils.showError("Không thể lưu thay đổi: " + error.message);
  } finally {
    // Restore button
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
}

async function processUpdateResults(results) {
  const successful = [];
  const conflicts = [];

  results.forEach((result) => {
    if (result.status === "ok") {
      successful.push(result.studentID);
    } else if (result.status === "conflict") {
      conflicts.push(result.studentID);
    }
  });

  console.log(
    `Update results: ${successful.length} success, ${conflicts.length} conflicts`
  );

  if (conflicts.length > 0) {
    // Có conflict - cần reload data mới nhất
    Utils.showError(
      `Có ${conflicts.length} học sinh bị xung đột dữ liệu: ${conflicts.join(
        ", "
      )}`
    );

    // Reload dữ liệu mới nhất cho những record bị conflict
    await reloadConflictedData(conflicts);

    Utils.showError(
      `Đã reload dữ liệu mới nhất cho ${conflicts.length} học sinh bị conflict. Vui lòng chỉnh sửa lại.`
    );
  }

  if (successful.length > 0) {
    Utils.showSuccess(`Đã lưu thành công ${successful.length} thay đổi`);

    // Reload dữ liệu mới từ server để lấy date_update chính xác
    await reloadSuccessfulData(successful);
  }

  // Reset hasUnsavedChanges nếu tất cả đã lưu thành công
  if (conflicts.length === 0) {
    hasUnsavedChanges = false;
  }

  // Refresh display
  displayResults(Object.values(currentData));
}

async function reloadSuccessfulData(successfulStudentIDs) {
  // Lấy class_id hiện tại
  const classId = document.getElementById("classId").value.trim();

  try {
    // Reload toàn bộ dữ liệu class để lấy date_update mới từ server
    const freshData = await API.getScoresByClass(classId);

    // Cập nhật currentData và editingCache với dữ liệu mới từ server
    successfulStudentIDs.forEach((studentID) => {
      const freshRecord = freshData.find((r) => r.studentID === studentID);
      if (freshRecord) {
        // Cập nhật currentData với dữ liệu mới từ server (bao gồm date_update và version mới)
        currentData[studentID] = { ...freshRecord };

        // Cập nhật editingCache với dữ liệu mới từ server
        editingCache[studentID] = { ...freshRecord };
      }
    });

    console.log("Reloaded successful data for:", successfulStudentIDs);
  } catch (error) {
    console.error("Error reloading successful data:", error);
    Utils.showError("Không thể tải lại dữ liệu mới nhất");
  }
}

async function reloadConflictedData(conflictedStudentIDs) {
  // Lấy class_id hiện tại
  const classId = document.getElementById("classId").value.trim();

  try {
    // Reload toàn bộ dữ liệu class
    const freshData = await API.getScoresByClass(classId);

    // Cập nhật currentData và editingCache với dữ liệu mới
    conflictedStudentIDs.forEach((studentID) => {
      const freshRecord = freshData.find((r) => r.studentID === studentID);
      if (freshRecord) {
        // Cập nhật currentData dictionary
        currentData[studentID] = { ...freshRecord };

        // Cập nhật editingCache với dữ liệu mới nhất
        editingCache[studentID] = { ...freshRecord };
      }
    });

    console.log("Reloaded conflicted data for:", conflictedStudentIDs);
  } catch (error) {
    console.error("Error reloading conflicted data:", error);
    Utils.showError("Không thể tải lại dữ liệu mới nhất");
  }
}

function discardAllChanges() {
  if (!hasUnsavedChanges) {
    Utils.showError("Không có thay đổi nào để hủy");
    return;
  }

  if (!confirm("Bạn có chắc muốn hủy tất cả thay đổi chưa lưu?")) {
    return;
  }

  // Reset editingCache về currentData
  editingCache = {};
  Object.values(currentData).forEach((record) => {
    editingCache[record.studentID] = { ...record };
  });

  hasUnsavedChanges = false;

  // Refresh display
  displayResults(currentData);

  Utils.showSuccess("Đã hủy tất cả thay đổi");
}

function clearResults() {
  Utils.hideElement("resultsContainer");
  Utils.hideElement("noResults");
  Utils.hideElement("errorContainer");

  // Clear cache
  currentData = {};
  editingCache = {};
  hasUnsavedChanges = false;

  // Remove save button nếu có
  const saveContainer = document.getElementById("saveChangesContainer");
  if (saveContainer) {
    saveContainer.remove();
  }

  const tableBody = document.getElementById("scoresTableBody");
  if (tableBody) {
    tableBody.innerHTML = "";
  }
}

function clearAllResults() {
  clearResults();
  Utils.hideElement("loadingSpinner");
}

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

// Make functions available globally
window.clearResults = clearResults;
window.toggleEditMode = toggleEditMode;
window.saveRowEdit = saveRowEdit;
window.cancelRowEdit = cancelRowEdit;
window.saveAllChanges = saveAllChanges;
window.discardAllChanges = discardAllChanges;
window.handleStudentSearch = handleStudentSearch;
window.showAllStudents = showAllStudents;
