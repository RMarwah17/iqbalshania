/**
 * Script untuk mengubah nama tamu menggunakan URL Parameter
 * Cara Penggunaan:
 * - ?nama=John Doe
 * - ?to=Jane Smith
 * - ?guest=Bapak Ahmad
 * 
 * Contoh URL:
 * https://example.com/index.html?nama=Bapak%20Ahmad%20dan%20Keluarga
 */

(function() {
    'use strict';
    
    /**
     * Fungsi untuk mengambil parameter dari URL
     * @param {string} param - Nama parameter yang ingin diambil
     * @returns {string|null} - Nilai parameter atau null jika tidak ada
     */
    function getURLParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    /**
     * Fungsi untuk decode dan clean text
     * @param {string} text - Text yang akan di-decode
     * @returns {string} - Text yang sudah di-decode
     */
    function decodeText(text) {
        try {
            // Decode URI component dan replace + dengan spasi
            return decodeURIComponent(text.replace(/\+/g, ' '));
        } catch (e) {
            console.error('Error decoding text:', e);
            return text;
        }
    }
    
    /**
     * Fungsi untuk update nama tamu
     */
    function updateGuestName() {
        // Coba berbagai parameter yang mungkin digunakan
        const paramNames = ['nama', 'to', 'guest', 'tamu', 'name'];
        let guestName = null;
        
        // Loop melalui semua kemungkinan parameter
        for (let i = 0; i < paramNames.length; i++) {
            const param = getURLParameter(paramNames[i]);
            if (param) {
                guestName = decodeText(param);
                break;
            }
        }
        
        // Jika ada nama tamu dari URL, update element
        if (guestName) {
            const guestNameElement = document.getElementById('guestNameSlot');
            
            if (guestNameElement) {
                guestNameElement.textContent = guestName;
                console.log('Guest name updated to:', guestName);
            } else {
                console.warn('Element #guestNameSlot tidak ditemukan');
            }
            
            // Update juga di QR Modal jika ada
            const qrModalName = document.querySelector('#qrModal [style="color: #b2b2b2;"]');
            if (qrModalName && qrModalName.nextElementSibling) {
                qrModalName.nextElementSibling.textContent = guestName;
                console.log('QR Modal name updated to:', guestName);
            }
        } else {
            console.log('Tidak ada parameter nama tamu di URL. Menggunakan nama default.');
        }
    }
    
    // Jalankan saat DOM sudah siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateGuestName);
    } else {
        updateGuestName();
    }
    
    // Export function untuk testing (optional)
    window.updateGuestName = updateGuestName;
    
})();
