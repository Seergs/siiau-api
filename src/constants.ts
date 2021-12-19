export default {
  urls: {
    homePage: 'http://siiauescolar.siiau.udg.mx/wus/gupprincipal.inicio',
  },
  selectors: {
    login: {
      code: 'input[name=p_codigo_c]',
      nip: 'input[name=p_clave_c]',
      button: 'input[type=submit]',
    },
    home: {
      validator: 'Bienvenido al Sistema SIIAU - Escolar',
      studentsLink: "//a[contains(., 'ALUMNOS')]",
      academicLink: "//a[contains(., 'ACADÉMICA')]",
      studentInfo: "//a[contains(., 'Ficha')]",
    },
    studentInfo: {
      code: '//table/tbody/tr[2]/td[1]',
      name: '//table/tbody/tr[2]/td[2]',
      status: '//table/tbody/tr[3]/td[1]',
      degree: '//table/tbody/tr[3]/td[2]',
      admissionDate: '//table/tbody/tr[3]/td[3]',
      lastSemester: '//table/tbody/tr[3]/td[4]',
      career: '//table/tbody/tr[4]/td',
      campus: '//table/tbody/tr[5]/td',
      location: '//table/tbody/tr[6]/td',
      validator: 'Ficha técnica del estudiante'
    },
  },
};
