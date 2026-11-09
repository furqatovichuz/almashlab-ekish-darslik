const group = (title, items) => ({ title, items });

module.exports = [
  group("Kirish", [
    ["01_Titul_va_annotatsiya.pdf", "Titul va annotatsiya", "1–2"],
  ]),
  group("I Bob. Ma’ruzalar", [
    ["02_I-bob_Maruza_01_Fanga_kirish_maqsad_vazifa_ahamiyati_tarixi.pdf", "Fanga kirish. Fanning maqsadi, vazifalari hamda qishloq va xalq xo‘jaligidagi ahamiyati. Almashlab ekishning tarixi", "3–20"],
    ["03_I-bob_Maruza_02_Almashlab_ekishning_unumdorlik_hosildorlik_sifatdagi_ahamiyati.pdf", "Qishloq xo‘jalik ekinlarini almashlab ekishning tuproq unumdorligi, ekinlarni hosildorligini oshirish va sifatini yaxshilashdagi ahamiyati", "20–29"],
    ["04_I-bob_Maruza_03_Almashlab_ekishning_ilmiy_asoslari.pdf", "Qishloq xo‘jaligi ekinlarini almashlab ekishning ilmiy asoslari", "29–44"],
    ["05_I-bob_Maruza_04_Almashlab_ekishni_tadqiqotlarda_organish_uslubi.pdf", "Qishloq xo‘jaligi ekinlarini almashlab ekishning tadqiqotlarda o‘rganish uslubi", "44–54"],
    ["06_I-bob_Maruza_05_Tuproq_agroekologiyasi.pdf", "Tuproq agroekologiyasi", "55–63"],
    ["07_I-bob_Maruza_06_Tuproq_agroekologiyasiga_salbiy_tasir_etuvchi_omillar.pdf", "Tuproq agroekologiyasiga salbiy ta’sir etuvchi omillar", "63–75"],
    ["08_I-bob_Maruza_07_Tuproq_holatini_ekologik_barqarorlashtirishda_almashlab_ekish_orni.pdf", "Tuproqlar holatini ekologik barqarorlashtirishda almashlab ekishning o‘rni", "76–90"],
  ]),
  group("II Bob. Amaliy mashg’ulotlar", [
    ["09_II-bob_Amaliy_01_Ekinlar_salmogini_hisoblash.pdf", "Qisqa navbatli almashlab ekishda ekinlar salmog‘ini (ulushini) hisoblash", "91–92"],
    ["10_II-bob_Amaliy_02_Ekinlarni_dalada_joylashtirish_tartibi.pdf", "Qishloq xo‘jalik ekinlarini qisqa navbatli almashlab ekish tadqiqotlarida dalada joylashtirish tartibi", "93–98"],
    ["11_II-bob_Amaliy_03_Organik_ogitlarning_orni.pdf", "Organik o‘g‘itlarning tuproq agroekologiyasidagi o‘rni", "98–104"],
    ["12_II-bob_Amaliy_04_Mineral_ogitlarning_orni.pdf", "Mineral o‘g‘itlarning tuproq agroekologiyasidagi o‘rni", "104–108"],
    ["13_II-bob_Amaliy_05_Tuproqning_mikrobiologik_xossalari.pdf", "Qisqa navbatli almashlab ekish tizimlarida tuproqning mikrobiologik xossalari", "108–125"],
    ["14_II-bob_Amaliy_06_Gozaning_vilt_kasalligi_bilan_zararlanishi.pdf", "Qisqa navbatli almashlab ekish tizimlarida g‘o‘zaning vilt kasalligi bilan zararlanishi", "125–130"],
    ["15_II-bob_Amaliy_07_Tuproqning_mikrobiologik_xossalari.pdf", "Qisqa navbatli almashlab ekish tizimlarida tuproqning mikrobiologik xossalari", "131–138"],
    ["16_II-bob_Amaliy_08_Tuproqning_agrokimyoviy_xossalari.pdf", "Tuproqning agrokimyoviy xossalari", "138–147"],
    ["17_II-bob_Amaliy_09_Angiz_va_ildiz_qoldiqlari.pdf", "Qishloq xo‘jalik ekinlarining ang‘iz va ildiz qoldiqlari", "147–153"],
    ["18_II-bob_Amaliy_10_Angiz_va_ildiz_qoldiqlari_tarkibidagi_oziqa_elementlari.pdf", "Qishloq xo‘jalik ekinlarining ang‘iz va ildiz qoldiqlari tarkibidagi oziqa elementlari", "153–164"],
    ["19_II-bob_Amaliy_11_Beda-goza_va_qisqa_navbatli_almashlab_ekishning_iqtisodiy_samaradorligi.pdf", "Beda-g‘o‘za va qisqa navbatli almashlab ekishning iqtisodiy samaradorligi", "164–172"],
  ]),
  group("Qo‘shimcha bo‘limlar", [
    ["20_Test_savollari.pdf", "Test savollari", "172–174"],
    ["21_Glossariy.pdf", "Glossariy", "175–176"],
    ["22_Mustaqil_talim_mavzulari.pdf", "Mustaqil ta’lim mavzulari", "177"],
    ["23_Foydalanilgan_adabiyotlar.pdf", "Foydalanilgan adabiyotlar", "178"],
    ["24_Mundarija.pdf", "Mundarija", "179–180"],
  ]),
].map((g) => ({
  title: g.title,
  items: g.items.map(([file, title, pages]) => ({ file, title, pages })),
}));
