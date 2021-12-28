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
      studentGrades: "//a[contains(., 'Boleta')]",
      studentKardex: "//a[contains(., 'Kárdex')]"
    },
    studentInfo: {
      code: '/html/body/div[3]/table/tbody/tr[2]/td[1]',
      name: '/html/body/div[3]/table/tbody/tr[2]/td[2]',
      status: '/html/body/div[3]/table/tbody/tr[3]/td[1]',
      degree: '/html/body/div[3]/table/tbody/tr[3]/td[2]',
      admissionDate: '/html/body/div[3]/table/tbody/tr[3]/td[3]',
      lastCalendar: '/html/body/div[3]/table/tbody/tr[3]/td[4]',
      career: '/html/body/div[3]/table/tbody/tr[4]/td',
      campus: '/html/body/div[3]/table/tbody/tr[5]/td',
      location: '/html/body/div[3]/table/tbody/tr[6]/td',
      validator: 'Ficha técnica del estudiante'
    },
    studentProgress: {
      cell: '/html/body/div[5]/table[1]/tbody/tr[{i}]/td[{j}]',
      totalCell: '/html/body/div[5]/table[1]/tbody/tr[{i}]/th[{j}]',
      regularCells: {
        1: 'calendar',
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
    },
    studentGrades: {
      validator: 'Boleta de calificaciones',
      cell: '/html/body/div/div[4]/table/tbody/tr[{i}]/td[{j}]' ,
      cells: {
	1: 'nrc',
	2: 'subjectId',
	3: 'subject',
	4: 'grade',
	5: 'isInKardex',
	6: 'grade',
	7: 'isInKardex'
      }
    },
    studentKardex: {
      validator: 'Nombre de la materia',
      calendarHeading: '//*[@id="leyendaPromedio"]/table[1]/tbody/tr[{i}]/th',
      calendarHeadingValidator: 'Calendario {1}',
      cell: '//*[@id="leyendaPromedio"]/table[1]/tbody/tr[{j}]/td[{k}]',
      cells: {
	1: 'nrc',
	2: 'subjectId',
	3: 'subject',
	4: 'grade',
	5: 'type',
	6: 'credits',
	7: 'date'
      }
    }
  },
};
