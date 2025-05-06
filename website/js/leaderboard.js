/**
 * leaderboard.js - 包含 leaderboard 页面特有的 JavaScript 功能
 */

// 表格文件映射
const tableFiles = {
    'main': '../tables/main_results.html',
    'category': '../tables/category_results.html',
    'ppl': '../tables/defense_results_ppl.html',
    'retokenization': '../tables/defense_results_retokenization.html',
    'self_reminder': '../tables/defense_results_self_reminder.html',
    'llama_guard_3_1B': '../tables/defense_results_llama_guard_3_1B.html'
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始加载主表格内容
    loadInitialTable();
    
    // 设置侧边栏项目点击事件
    setupSidebarEvents();
});

/**
 * 初始加载主表格
 */
function loadInitialTable() {
    // 显示加载指示器
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
    }
    
    // 加载主表格
    loadTableContent('main', tableFiles['main'])
        .then(() => {
            // 隐藏加载指示器
            if (loadingIndicator) {
                loadingIndicator.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error loading initial table:', error);
            if (loadingIndicator) {
                loadingIndicator.classList.remove('active');
            }
        });
    
    // 设置初始表格标题
    const initialActiveItem = document.querySelector('.sidebar-item.active');
    if (initialActiveItem) {
        document.querySelector('.table-header').textContent = initialActiveItem.textContent;
    }
}

/**
 * 设置侧边栏项目点击事件
 */
function setupSidebarEvents() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            // 显示加载指示器
            const loadingIndicator = document.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('active');
            }
            
            // 更新活动的侧边栏项目
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // 获取目标表格 ID
            const targetTableId = this.getAttribute('data-target');
            
            // 更新表格标题以匹配点击的侧边栏项目
            document.querySelector('.table-header').textContent = this.textContent;
            
            // 隐藏所有表格并显示目标表格
            document.querySelectorAll('.table-container').forEach(table => {
                table.classList.remove('active');
            });
            
            const targetContainer = document.getElementById(targetTableId);
            targetContainer.classList.add('active');
            
            // 确定是否需要加载表格内容
            let loadPromise = Promise.resolve();
            if (
                (targetTableId === 'category' && !targetContainer.querySelector('table')) ||
                (targetTableId !== 'category' && targetContainer.innerHTML.trim() === '<!-- Table content will be loaded here -->')
            ) {
                loadPromise = loadTableContent(targetTableId, tableFiles[targetTableId]);
            } else {
                // 如果表格内容已加载，确保再次应用表头样式
                applyHeaderStyles(targetTableId);
            }
            
            // 处理加载完成后的状态
            loadPromise.finally(() => {
                // 隐藏加载指示器
                if (loadingIndicator) {
                    loadingIndicator.classList.remove('active');
                }
            });
        });
    });
}

/**
 * 加载表格内容
 * @param {string} containerId - 容器ID
 * @param {string} tablePath - 表格文件路径
 * @returns {Promise} - 加载完成的Promise
 */
function loadTableContent(containerId, tablePath) {
    return new Promise((resolve, reject) => {
        const container = document.getElementById(containerId);
        
        fetch(tablePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // 解析表格内容
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const table = doc.querySelector('table');
                
                // 特殊处理 category 表格
                if (containerId === 'category') {
                    // 保留图片容器，添加表格
                    const imgContainer = container.querySelector('.category-image-container');
                    if (imgContainer && table) {
                        // 清除除了图片容器之外的内容
                        while (container.lastChild !== imgContainer) {
                            container.removeChild(container.lastChild);
                        }
                        // 添加表格
                        container.appendChild(table);
                    } else if (table) {
                        // 如果找不到图片容器但有表格，添加表格
                        container.appendChild(table);
                    } else {
                        // 保留图片容器，添加其他HTML内容
                        container.innerHTML = container.querySelector('.category-image-container').outerHTML + html;
                    }
                } else {
                    // 其他表格正常处理
                    if (table) {
                        container.innerHTML = table.outerHTML;
                    } else {
                        container.innerHTML = html;
                    }
                }
                
                // 确保表格第一行样式应用
                setTimeout(() => {
                    applyHeaderStyles(containerId);
                    resolve();
                }, 100);
            })
            .catch(error => {
                console.error('Error loading table:', error);
                const errorMsg = `
                    <div class="error-message" style="text-align: center; padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px 0;">
                        <h3>Error Loading Table</h3>
                        <p>${error.message}</p>
                        <button onclick="retryLoadTable('${containerId}', '${tablePath}')" style="margin-top: 10px; padding: 5px 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Retry
                        </button>
                    </div>
                `;
                
                if (containerId === 'category') {
                    // 保留图片容器，添加错误信息
                    const imgContainer = container.querySelector('.category-image-container');
                    if (imgContainer) {
                        // 添加错误信息在图片之后
                        imgContainer.insertAdjacentHTML('afterend', errorMsg);
                    } else {
                        container.innerHTML = errorMsg;
                    }
                } else {
                    container.innerHTML = errorMsg;
                }
                
                reject(error);
            });
    });
}

/**
 * 重试加载表格
 * @param {string} containerId - 容器ID
 * @param {string} tablePath - 表格文件路径
 */
function retryLoadTable(containerId, tablePath) {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
    }
    
    loadTableContent(containerId, tablePath)
        .finally(() => {
            if (loadingIndicator) {
                loadingIndicator.classList.remove('active');
            }
        });
}

/**
 * 应用表头样式
 * @param {string} containerId - 容器ID
 */
function applyHeaderStyles(containerId) {
    const container = document.getElementById(containerId);
    let tableElement;
    
    // 特殊处理 category 表格
    if (containerId === 'category') {
        const tableContentContainer = container.querySelector('.category-table-content');
        if (tableContentContainer) {
            tableElement = tableContentContainer.querySelector('table');
        } else {
            tableElement = container.querySelector('table');
        }
    } else {
        tableElement = container.querySelector('table');
    }
    
    if (tableElement && tableElement.rows.length > 0) {
        const firstRow = tableElement.rows[0];
        if (firstRow) {
            Array.from(firstRow.cells).forEach(cell => {
                cell.style.backgroundColor = '#eaeaea';
                cell.style.fontWeight = '500';
                cell.style.color = '#000000';
            });
        }
    }
}

// 确保 retryLoadTable 函数在全局作用域可用
window.retryLoadTable = retryLoadTable; 