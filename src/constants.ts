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
      code: '/html/body/div[3]/table/tbody/tr[2]/td[1]',
      name: '/html/body/div[3]/table/tbody/tr[2]/td[2]',
      status: '/html/body/div[3]/table/tbody/tr[3]/td[1]',
      degree: '/html/body/div[3]/table/tbody/tr[3]/td[2]',
      admissionDate: '/html/body/div[3]/table/tbody/tr[3]/td[3]',
      lastSemester: '/html/body/div[3]/table/tbody/tr[3]/td[4]',
      career: '/html/body/div[3]/table/tbody/tr[4]/td',
      campus: '/html/body/div[3]/table/tbody/tr[5]/td',
      location: '/html/body/div[3]/table/tbody/tr[6]/td',
      validator: 'Ficha técnica del estudiante'
    },
    studentProgress: {
      cell: '/html/body/div[5]/table[1]/tbody/tr[{i}]/td[{j}]',
      totalCell: '/html/body/div[5]/table[1]/tbody/tr[{i}]/th[{j}]',
      regularCells: {
        1: 'semester',
        2: 'admission',
        3: 'career',
        4: 'campus',
        5: 'campusAlt',
        6: 'gpa',
        7: 'credits',
        8: 'percentage'
      }, 
      totalCells: {
        6: 'totalGpa',
        7: 'totalCredits',
        8: 'totalPercentage'
      }
    }
  },
};
