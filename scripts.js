document.addEventListener('DOMContentLoaded', function() {
    // 當滾動到特定區域時添加動畫效果
    const sections = document.querySelectorAll('.section');
    
    function checkScroll() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if(sectionTop < windowHeight * 0.77) {
                section.style.opacity = '1';
            }
        });
    }
    
    // 監聽滾動事件
    window.addEventListener('scroll', checkScroll);
    
    // 初始檢查，確保頁面加載時可見的部分會顯示
    checkScroll();
});