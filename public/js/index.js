    document.addEventListener('DOMContentLoaded', () => {
        const toggleButtons = document.querySelectorAll('.toggle-btn');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const faqQuestion = button.closest('.faq-question');
                const faqAnswer = faqQuestion.nextElementSibling;
    
                faqQuestion.classList.toggle('open');
                faqAnswer.style.display = faqAnswer.style.display === 'block' ? 'none' : 'block';
            });
        });
       
    const section = document.querySelector(".additional-features");

    function revealOnScroll() {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight * 0.8) {
            section.classList.add("visible");
        }
    }
    window.addEventListener("scroll", function() {
        var header = document.querySelector("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

        
    });

    
