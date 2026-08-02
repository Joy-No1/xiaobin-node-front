/**
 * 中国省市区三级联动数据（简化版）
 * 包含全部省份、地级市、及主要区县
 * value 使用国标行政区划代码前6位
 */

export const regions = [
  {
    value: '110000', label: '北京市', children: [
      { value: '110100', label: '北京市', children: [
        { value: '110101', label: '东城区' }, { value: '110102', label: '西城区' },
        { value: '110105', label: '朝阳区' }, { value: '110106', label: '丰台区' },
        { value: '110107', label: '石景山区' }, { value: '110108', label: '海淀区' },
        { value: '110109', label: '门头沟区' }, { value: '110111', label: '房山区' },
        { value: '110112', label: '通州区' }, { value: '110113', label: '顺义区' },
        { value: '110114', label: '昌平区' }, { value: '110115', label: '大兴区' },
        { value: '110116', label: '怀柔区' }, { value: '110117', label: '平谷区' },
        { value: '110118', label: '密云区' }, { value: '110119', label: '延庆区' },
      ]}
    ]
  },
  {
    value: '120000', label: '天津市', children: [
      { value: '120100', label: '天津市', children: [
        { value: '120101', label: '和平区' }, { value: '120102', label: '河东区' },
        { value: '120103', label: '河西区' }, { value: '120104', label: '南开区' },
        { value: '120105', label: '河北区' }, { value: '120106', label: '红桥区' },
        { value: '120110', label: '东丽区' }, { value: '120111', label: '西青区' },
        { value: '120112', label: '津南区' }, { value: '120113', label: '北辰区' },
        { value: '120114', label: '武清区' }, { value: '120115', label: '宝坻区' },
        { value: '120116', label: '滨海新区' }, { value: '120117', label: '宁河区' },
        { value: '120118', label: '静海区' }, { value: '120119', label: '蓟州区' },
      ]}
    ]
  },
  {
    value: '130000', label: '河北省', children: [
      { value: '130100', label: '石家庄市', children: [
        { value: '130102', label: '长安区' }, { value: '130104', label: '桥西区' },
        { value: '130105', label: '新华区' }, { value: '130107', label: '井陉矿区' },
        { value: '130108', label: '裕华区' }, { value: '130109', label: '藁城区' },
        { value: '130110', label: '鹿泉区' }, { value: '130111', label: '栾城区' },
        { value: '130121', label: '井陉县' }, { value: '130123', label: '正定县' },
        { value: '130125', label: '行唐县' }, { value: '130126', label: '灵寿县' },
        { value: '130127', label: '高邑县' }, { value: '130128', label: '深泽县' },
        { value: '130129', label: '赞皇县' }, { value: '130130', label: '无极县' },
        { value: '130131', label: '平山县' }, { value: '130132', label: '元氏县' },
        { value: '130133', label: '赵县' },
      ]},
      { value: '130200', label: '唐山市', children: [
        { value: '130202', label: '路南区' }, { value: '130203', label: '路北区' },
        { value: '130204', label: '古冶区' }, { value: '130205', label: '开平区' },
        { value: '130207', label: '丰南区' }, { value: '130208', label: '丰润区' },
        { value: '130209', label: '曹妃甸区' },
        { value: '130224', label: '滦南县' }, { value: '130225', label: '乐亭县' },
        { value: '130227', label: '迁西县' }, { value: '130229', label: '玉田县' },
        { value: '130281', label: '遵化市' }, { value: '130283', label: '迁安市' },
        { value: '130284', label: '滦州市' },
      ]},
      { value: '130300', label: '秦皇岛市', children: [
        { value: '130302', label: '海港区' }, { value: '130303', label: '山海关区' },
        { value: '130304', label: '北戴河区' }, { value: '130306', label: '抚宁区' },
        { value: '130321', label: '青龙满族自治县' }, { value: '130322', label: '昌黎县' },
        { value: '130324', label: '卢龙县' },
      ]},
      { value: '130400', label: '邯郸市', children: [
        { value: '130402', label: '邯山区' }, { value: '130403', label: '丛台区' },
        { value: '130404', label: '复兴区' }, { value: '130406', label: '峰峰矿区' },
        { value: '130423', label: '临漳县' }, { value: '130424', label: '成安县' },
        { value: '130425', label: '大名县' }, { value: '130426', label: '涉县' },
        { value: '130427', label: '磁县' }, { value: '130428', label: '肥乡区' },
        { value: '130429', label: '永年区' }, { value: '130430', label: '邱县' },
        { value: '130431', label: '鸡泽县' }, { value: '130432', label: '广平县' },
        { value: '130433', label: '馆陶县' }, { value: '130434', label: '魏县' },
        { value: '130435', label: '曲周县' }, { value: '130481', label: '武安市' },
      ]},
      { value: '130500', label: '邢台市', children: [
        { value: '130502', label: '襄都区' }, { value: '130503', label: '信都区' },
        { value: '130505', label: '任泽区' }, { value: '130506', label: '南和区' },
        { value: '130522', label: '临城县' }, { value: '130523', label: '内丘县' },
        { value: '130524', label: '柏乡县' }, { value: '130525', label: '隆尧县' },
        { value: '130528', label: '宁晋县' }, { value: '130529', label: '巨鹿县' },
        { value: '130530', label: '新河县' }, { value: '130531', label: '广宗县' },
        { value: '130532', label: '平乡县' }, { value: '130533', label: '威县' },
        { value: '130534', label: '清河县' }, { value: '130535', label: '临西县' },
        { value: '130581', label: '南宫市' }, { value: '130582', label: '沙河市' },
      ]},
      { value: '130600', label: '保定市', children: [
        { value: '130602', label: '竞秀区' }, { value: '130606', label: '莲池区' },
        { value: '130607', label: '满城区' }, { value: '130608', label: '清苑区' },
        { value: '130609', label: '徐水区' }, { value: '130623', label: '涞水县' },
        { value: '130624', label: '阜平县' }, { value: '130626', label: '定兴县' },
        { value: '130627', label: '唐县' }, { value: '130628', label: '高阳县' },
        { value: '130629', label: '容城县' }, { value: '130630', label: '涞源县' },
        { value: '130631', label: '望都县' }, { value: '130632', label: '安新县' },
        { value: '130633', label: '易县' }, { value: '130634', label: '曲阳县' },
        { value: '130635', label: '蠡县' }, { value: '130636', label: '顺平县' },
        { value: '130637', label: '博野县' }, { value: '130638', label: '雄县' },
        { value: '130681', label: '涿州市' }, { value: '130682', label: '定州市' },
        { value: '130683', label: '安国市' }, { value: '130684', label: '高碑店市' },
      ]},
      { value: '130700', label: '张家口市', children: [
        { value: '130702', label: '桥东区' }, { value: '130703', label: '桥西区' },
        { value: '130705', label: '宣化区' }, { value: '130706', label: '下花园区' },
        { value: '130708', label: '万全区' }, { value: '130709', label: '崇礼区' },
        { value: '130722', label: '张北县' }, { value: '130723', label: '康保县' },
        { value: '130724', label: '沽源县' }, { value: '130725', label: '尚义县' },
        { value: '130726', label: '蔚县' }, { value: '130727', label: '阳原县' },
        { value: '130728', label: '怀安县' }, { value: '130730', label: '怀来县' },
        { value: '130731', label: '涿鹿县' }, { value: '130732', label: '赤城县' },
      ]},
      { value: '130800', label: '承德市', children: [
        { value: '130802', label: '双桥区' }, { value: '130803', label: '双滦区' },
        { value: '130804', label: '鹰手营子矿区' }, { value: '130821', label: '承德县' },
        { value: '130822', label: '兴隆县' }, { value: '130824', label: '滦平县' },
        { value: '130825', label: '隆化县' }, { value: '130826', label: '丰宁满族自治县' },
        { value: '130827', label: '宽城满族自治县' }, { value: '130828', label: '围场满族蒙古族自治县' },
        { value: '130881', label: '平泉市' },
      ]},
      { value: '130900', label: '沧州市', children: [
        { value: '130902', label: '新华区' }, { value: '130903', label: '运河区' },
        { value: '130921', label: '沧县' }, { value: '130922', label: '青县' },
        { value: '130923', label: '东光县' }, { value: '130924', label: '海兴县' },
        { value: '130925', label: '盐山县' }, { value: '130926', label: '肃宁县' },
        { value: '130927', label: '南皮县' }, { value: '130928', label: '吴桥县' },
        { value: '130929', label: '献县' }, { value: '130930', label: '孟村回族自治县' },
        { value: '130981', label: '泊头市' }, { value: '130982', label: '任丘市' },
        { value: '130983', label: '黄骅市' }, { value: '130984', label: '河间市' },
      ]},
      { value: '131000', label: '廊坊市', children: [
        { value: '131002', label: '安次区' }, { value: '131003', label: '广阳区' },
        { value: '131022', label: '固安县' }, { value: '131023', label: '永清县' },
        { value: '131024', label: '香河县' }, { value: '131025', label: '大城县' },
        { value: '131026', label: '文安县' }, { value: '131028', label: '大厂回族自治县' },
        { value: '131081', label: '霸州市' }, { value: '131082', label: '三河市' },
      ]},
      { value: '131100', label: '衡水市', children: [
        { value: '131102', label: '桃城区' }, { value: '131103', label: '冀州区' },
        { value: '131121', label: '枣强县' }, { value: '131122', label: '武邑县' },
        { value: '131123', label: '武强县' }, { value: '131124', label: '饶阳县' },
        { value: '131125', label: '安平县' }, { value: '131126', label: '故城县' },
        { value: '131127', label: '景县' }, { value: '131128', label: '阜城县' },
        { value: '131182', label: '深州市' },
      ]},
    ]
  },
  {
    value: '140000', label: '山西省', children: [
      { value: '140100', label: '太原市', children: [
        { value: '140105', label: '小店区' }, { value: '140106', label: '迎泽区' },
        { value: '140107', label: '杏花岭区' }, { value: '140108', label: '尖草坪区' },
        { value: '140109', label: '万柏林区' }, { value: '140110', label: '晋源区' },
        { value: '140121', label: '清徐县' }, { value: '140122', label: '阳曲县' },
        { value: '140123', label: '娄烦县' }, { value: '140181', label: '古交市' },
      ]},
      { value: '140200', label: '大同市', children: [
        { value: '140213', label: '平城区' }, { value: '140214', label: '云冈区' },
        { value: '140215', label: '云州区' }, { value: '140221', label: '阳高县' },
        { value: '140222', label: '天镇县' }, { value: '140223', label: '广灵县' },
        { value: '140224', label: '灵丘县' }, { value: '140225', label: '浑源县' },
        { value: '140226', label: '左云县' },
      ]},
      { value: '140300', label: '阳泉市', children: [
        { value: '140302', label: '城区' }, { value: '140303', label: '矿区' },
        { value: '140311', label: '郊区' }, { value: '140321', label: '平定县' },
        { value: '140322', label: '盂县' },
      ]},
      { value: '140400', label: '长治市', children: [
        { value: '140403', label: '潞州区' }, { value: '140404', label: '上党区' },
        { value: '140405', label: '屯留区' }, { value: '140406', label: '潞城区' },
        { value: '140423', label: '襄垣县' }, { value: '140425', label: '平顺县' },
        { value: '140426', label: '黎城县' }, { value: '140427', label: '壶关县' },
        { value: '140428', label: '长子县' }, { value: '140429', label: '武乡县' },
        { value: '140430', label: '沁县' }, { value: '140431', label: '沁源县' },
      ]},
      { value: '140500', label: '晋城市', children: [
        { value: '140502', label: '城区' }, { value: '140521', label: '沁水县' },
        { value: '140522', label: '阳城县' }, { value: '140524', label: '陵川县' },
        { value: '140525', label: '泽州县' }, { value: '140581', label: '高平市' },
      ]},
    ]
  },
  {
    value: '150000', label: '内蒙古自治区', children: [
      { value: '150100', label: '呼和浩特市', children: [
        { value: '150102', label: '新城区' }, { value: '150103', label: '回民区' },
        { value: '150104', label: '玉泉区' }, { value: '150105', label: '赛罕区' },
        { value: '150121', label: '土默特左旗' }, { value: '150122', label: '托克托县' },
        { value: '150123', label: '和林格尔县' }, { value: '150124', label: '清水河县' },
        { value: '150125', label: '武川县' },
      ]},
      { value: '150200', label: '包头市', children: [
        { value: '150202', label: '东河区' }, { value: '150203', label: '昆都仑区' },
        { value: '150204', label: '青山区' }, { value: '150205', label: '石拐区' },
        { value: '150206', label: '白云鄂博矿区' }, { value: '150207', label: '九原区' },
        { value: '150221', label: '土默特右旗' }, { value: '150222', label: '固阳县' },
        { value: '150223', label: '达尔罕茂明安联合旗' },
      ]},
      { value: '150400', label: '赤峰市', children: [
        { value: '150402', label: '红山区' }, { value: '150403', label: '元宝山区' },
        { value: '150404', label: '松山区' }, { value: '150421', label: '阿鲁科尔沁旗' },
        { value: '150422', label: '巴林左旗' }, { value: '150423', label: '巴林右旗' },
        { value: '150424', label: '林西县' }, { value: '150425', label: '克什克腾旗' },
        { value: '150426', label: '翁牛特旗' }, { value: '150428', label: '喀喇沁旗' },
        { value: '150429', label: '宁城县' }, { value: '150430', label: '敖汉旗' },
      ]},
      { value: '150600', label: '鄂尔多斯市', children: [
        { value: '150602', label: '东胜区' }, { value: '150603', label: '康巴什区' },
        { value: '150621', label: '达拉特旗' }, { value: '150622', label: '准格尔旗' },
        { value: '150623', label: '鄂托克前旗' }, { value: '150624', label: '鄂托克旗' },
        { value: '150625', label: '杭锦旗' }, { value: '150626', label: '乌审旗' },
        { value: '150627', label: '伊金霍洛旗' },
      ]},
    ]
  },
  {
    value: '210000', label: '辽宁省', children: [
      { value: '210100', label: '沈阳市', children: [
        { value: '210102', label: '和平区' }, { value: '210103', label: '沈河区' },
        { value: '210104', label: '大东区' }, { value: '210105', label: '皇姑区' },
        { value: '210106', label: '铁西区' }, { value: '210111', label: '苏家屯区' },
        { value: '210112', label: '浑南区' }, { value: '210113', label: '沈北新区' },
        { value: '210114', label: '于洪区' }, { value: '210115', label: '辽中区' },
        { value: '210123', label: '康平县' }, { value: '210124', label: '法库县' },
        { value: '210181', label: '新民市' },
      ]},
      { value: '210200', label: '大连市', children: [
        { value: '210202', label: '中山区' }, { value: '210203', label: '西岗区' },
        { value: '210204', label: '沙河口区' }, { value: '210211', label: '甘井子区' },
        { value: '210212', label: '旅顺口区' }, { value: '210213', label: '金州区' },
        { value: '210214', label: '普兰店区' }, { value: '210224', label: '长海县' },
        { value: '210281', label: '瓦房店市' }, { value: '210283', label: '庄河市' },
      ]},
      { value: '210300', label: '鞍山市', children: [
        { value: '210302', label: '铁东区' }, { value: '210303', label: '铁西区' },
        { value: '210304', label: '立山区' }, { value: '210311', label: '千山区' },
        { value: '210321', label: '台安县' }, { value: '210323', label: '岫岩满族自治县' },
        { value: '210381', label: '海城市' },
      ]},
      { value: '210400', label: '抚顺市', children: [
        { value: '210402', label: '新抚区' }, { value: '210403', label: '东洲区' },
        { value: '210404', label: '望花区' }, { value: '210411', label: '顺城区' },
        { value: '210421', label: '抚顺县' }, { value: '210422', label: '新宾满族自治县' },
        { value: '210423', label: '清原满族自治县' },
      ]},
    ]
  },
  {
    value: '220000', label: '吉林省', children: [
      { value: '220100', label: '长春市', children: [
        { value: '220102', label: '南关区' }, { value: '220103', label: '宽城区' },
        { value: '220104', label: '朝阳区' }, { value: '220105', label: '二道区' },
        { value: '220106', label: '绿园区' }, { value: '220112', label: '双阳区' },
        { value: '220113', label: '九台区' }, { value: '220122', label: '农安县' },
        { value: '220182', label: '榆树市' }, { value: '220183', label: '德惠市' },
      ]},
      { value: '220200', label: '吉林市', children: [
        { value: '220202', label: '昌邑区' }, { value: '220203', label: '龙潭区' },
        { value: '220204', label: '船营区' }, { value: '220211', label: '丰满区' },
        { value: '220221', label: '永吉县' }, { value: '220281', label: '蛟河市' },
        { value: '220282', label: '桦甸市' }, { value: '220283', label: '舒兰市' },
        { value: '220284', label: '磐石市' },
      ]},
    ]
  },
  {
    value: '230000', label: '黑龙江省', children: [
      { value: '230100', label: '哈尔滨市', children: [
        { value: '230102', label: '道里区' }, { value: '230103', label: '南岗区' },
        { value: '230104', label: '道外区' }, { value: '230108', label: '平房区' },
        { value: '230109', label: '松北区' }, { value: '230110', label: '香坊区' },
        { value: '230111', label: '呼兰区' }, { value: '230112', label: '阿城区' },
        { value: '230113', label: '双城区' }, { value: '230123', label: '依兰县' },
        { value: '230124', label: '方正县' }, { value: '230125', label: '宾县' },
        { value: '230126', label: '巴彦县' }, { value: '230127', label: '木兰县' },
        { value: '230128', label: '通河县' }, { value: '230129', label: '延寿县' },
        { value: '230183', label: '尚志市' }, { value: '230184', label: '五常市' },
      ]},
      { value: '230200', label: '齐齐哈尔市', children: [
        { value: '230202', label: '龙沙区' }, { value: '230203', label: '建华区' },
        { value: '230204', label: '铁锋区' }, { value: '230205', label: '昂昂溪区' },
        { value: '230206', label: '富拉尔基区' }, { value: '230207', label: '碾子山区' },
        { value: '230208', label: '梅里斯达斡尔族区' }, { value: '230221', label: '龙江县' },
        { value: '230223', label: '依安县' }, { value: '230224', label: '泰来县' },
        { value: '230225', label: '甘南县' }, { value: '230227', label: '富裕县' },
        { value: '230229', label: '克山县' }, { value: '230230', label: '克东县' },
        { value: '230231', label: '拜泉县' }, { value: '230281', label: '讷河市' },
      ]},
      { value: '230600', label: '大庆市', children: [
        { value: '230602', label: '萨尔图区' }, { value: '230603', label: '龙凤区' },
        { value: '230604', label: '让胡路区' }, { value: '230605', label: '红岗区' },
        { value: '230606', label: '大同区' }, { value: '230621', label: '肇州县' },
        { value: '230622', label: '肇源县' }, { value: '230623', label: '林甸县' },
        { value: '230624', label: '杜尔伯特蒙古族自治县' },
      ]},
    ]
  },
  {
    value: '310000', label: '上海市', children: [
      { value: '310100', label: '上海市', children: [
        { value: '310101', label: '黄浦区' }, { value: '310104', label: '徐汇区' },
        { value: '310105', label: '长宁区' }, { value: '310106', label: '静安区' },
        { value: '310107', label: '普陀区' }, { value: '310109', label: '虹口区' },
        { value: '310110', label: '杨浦区' }, { value: '310112', label: '闵行区' },
        { value: '310113', label: '宝山区' }, { value: '310114', label: '嘉定区' },
        { value: '310115', label: '浦东新区' }, { value: '310116', label: '金山区' },
        { value: '310117', label: '松江区' }, { value: '310118', label: '青浦区' },
        { value: '310120', label: '奉贤区' }, { value: '310151', label: '崇明区' },
      ]}
    ]
  },
  {
    value: '320000', label: '江苏省', children: [
      { value: '320100', label: '南京市', children: [
        { value: '320102', label: '玄武区' }, { value: '320104', label: '秦淮区' },
        { value: '320105', label: '建邺区' }, { value: '320106', label: '鼓楼区' },
        { value: '320111', label: '浦口区' }, { value: '320113', label: '栖霞区' },
        { value: '320114', label: '雨花台区' }, { value: '320115', label: '江宁区' },
        { value: '320116', label: '六合区' }, { value: '320117', label: '溧水区' },
        { value: '320118', label: '高淳区' },
      ]},
      { value: '320200', label: '无锡市', children: [
        { value: '320205', label: '锡山区' }, { value: '320206', label: '惠山区' },
        { value: '320211', label: '滨湖区' }, { value: '320213', label: '梁溪区' },
        { value: '320214', label: '新吴区' },
      ]},
      { value: '320300', label: '徐州市', children: [
        { value: '320302', label: '鼓楼区' }, { value: '320303', label: '云龙区' },
        { value: '320305', label: '贾汪区' }, { value: '320311', label: '泉山区' },
      ]},
      { value: '320400', label: '常州市', children: [
        { value: '320402', label: '天宁区' }, { value: '320404', label: '钟楼区' },
        { value: '320411', label: '新北区' }, { value: '320412', label: '武进区' },
      ]},
      { value: '320500', label: '苏州市', children: [
        { value: '320505', label: '虎丘区' }, { value: '320506', label: '吴中区' },
        { value: '320507', label: '相城区' }, { value: '320508', label: '姑苏区' },
        { value: '320509', label: '吴江区' },
      ]},
      { value: '320600', label: '南通市', children: [
        { value: '320602', label: '崇川区' }, { value: '320611', label: '通州区' },
      ]},
      { value: '320700', label: '连云港市', children: [
        { value: '320703', label: '连云区' }, { value: '320706', label: '海州区' },
      ]},
      { value: '320800', label: '淮安市', children: [
        { value: '320803', label: '淮安区' }, { value: '320804', label: '淮阴区' },
      ]},
      { value: '320900', label: '盐城市', children: [
        { value: '320902', label: '亭湖区' }, { value: '320903', label: '盐都区' },
      ]},
      { value: '321000', label: '扬州市', children: [
        { value: '321002', label: '广陵区' }, { value: '321003', label: '邗江区' },
        { value: '321012', label: '江都区' },
      ]},
      { value: '321100', label: '镇江市', children: [
        { value: '321102', label: '京口区' }, { value: '321111', label: '润州区' },
      ]},
      { value: '321200', label: '泰州市', children: [
        { value: '321202', label: '海陵区' }, { value: '321203', label: '高港区' },
      ]},
      { value: '321300', label: '宿迁市', children: [
        { value: '321302', label: '宿城区' }, { value: '321311', label: '宿豫区' },
      ]},
    ]
  },
  {
    value: '330000', label: '浙江省', children: [
      { value: '330100', label: '杭州市', children: [
        { value: '330102', label: '上城区' }, { value: '330105', label: '拱墅区' },
        { value: '330106', label: '西湖区' }, { value: '330108', label: '滨江区' },
        { value: '330109', label: '萧山区' }, { value: '330110', label: '余杭区' },
        { value: '330111', label: '富阳区' }, { value: '330112', label: '临安区' },
        { value: '330113', label: '临平区' }, { value: '330114', label: '钱塘区' },
      ]},
      { value: '330200', label: '宁波市', children: [
        { value: '330203', label: '海曙区' }, { value: '330205', label: '江北区' },
        { value: '330206', label: '北仑区' }, { value: '330211', label: '镇海区' },
        { value: '330212', label: '鄞州区' }, { value: '330213', label: '奉化区' },
      ]},
      { value: '330300', label: '温州市', children: [
        { value: '330302', label: '鹿城区' }, { value: '330303', label: '龙湾区' },
        { value: '330304', label: '瓯海区' },
      ]},
      { value: '330400', label: '嘉兴市', children: [
        { value: '330402', label: '南湖区' }, { value: '330411', label: '秀洲区' },
      ]},
      { value: '330500', label: '湖州市', children: [
        { value: '330502', label: '吴兴区' }, { value: '330503', label: '南浔区' },
      ]},
      { value: '330600', label: '绍兴市', children: [
        { value: '330602', label: '越城区' }, { value: '330603', label: '柯桥区' },
        { value: '330604', label: '上虞区' },
      ]},
      { value: '330700', label: '金华市', children: [
        { value: '330702', label: '婺城区' }, { value: '330703', label: '金东区' },
      ]},
      { value: '330800', label: '衢州市', children: [
        { value: '330802', label: '柯城区' }, { value: '330803', label: '衢江区' },
      ]},
      { value: '330900', label: '舟山市', children: [
        { value: '330902', label: '定海区' }, { value: '330903', label: '普陀区' },
      ]},
      { value: '331000', label: '台州市', children: [
        { value: '331002', label: '椒江区' }, { value: '331003', label: '黄岩区' },
        { value: '331004', label: '路桥区' },
      ]},
      { value: '331100', label: '丽水市', children: [
        { value: '331102', label: '莲都区' },
      ]},
    ]
  },
  {
    value: '340000', label: '安徽省', children: [
      { value: '340100', label: '合肥市', children: [
        { value: '340102', label: '瑶海区' }, { value: '340103', label: '庐阳区' },
        { value: '340104', label: '蜀山区' }, { value: '340111', label: '包河区' },
        { value: '340121', label: '长丰县' }, { value: '340122', label: '肥东县' },
        { value: '340123', label: '肥西县' }, { value: '340124', label: '庐江县' },
        { value: '340181', label: '巢湖市' },
      ]},
      { value: '340200', label: '芜湖市', children: [
        { value: '340202', label: '镜湖区' }, { value: '340207', label: '鸠江区' },
        { value: '340209', label: '弋江区' }, { value: '340210', label: '湾沚区' },
        { value: '340212', label: '繁昌区' }, { value: '340223', label: '南陵县' },
        { value: '340281', label: '无为市' },
      ]},
    ]
  },
  {
    value: '350000', label: '福建省', children: [
      { value: '350100', label: '福州市', children: [
        { value: '350102', label: '鼓楼区' }, { value: '350103', label: '台江区' },
        { value: '350104', label: '仓山区' }, { value: '350105', label: '马尾区' },
        { value: '350111', label: '晋安区' },
      ]},
      { value: '350200', label: '厦门市', children: [
        { value: '350203', label: '思明区' }, { value: '350205', label: '海沧区' },
        { value: '350206', label: '湖里区' }, { value: '350211', label: '集美区' },
        { value: '350212', label: '同安区' }, { value: '350213', label: '翔安区' },
      ]},
      { value: '350300', label: '莆田市', children: [
        { value: '350302', label: '城厢区' }, { value: '350303', label: '涵江区' },
      ]},
      { value: '350500', label: '泉州市', children: [
        { value: '350502', label: '鲤城区' }, { value: '350503', label: '丰泽区' },
        { value: '350504', label: '洛江区' },
      ]},
      { value: '350600', label: '漳州市', children: [
        { value: '350602', label: '芗城区' }, { value: '350603', label: '龙文区' },
      ]},
    ]
  },
  {
    value: '360000', label: '江西省', children: [
      { value: '360100', label: '南昌市', children: [
        { value: '360102', label: '东湖区' }, { value: '360103', label: '西湖区' },
        { value: '360104', label: '青云谱区' }, { value: '360111', label: '青山湖区' },
        { value: '360112', label: '新建区' }, { value: '360113', label: '红谷滩区' },
        { value: '360121', label: '南昌县' }, { value: '360123', label: '安义县' },
        { value: '360124', label: '进贤县' },
      ]},
      { value: '360200', label: '景德镇市', children: [
        { value: '360202', label: '昌江区' }, { value: '360203', label: '珠山区' },
        { value: '360222', label: '浮梁县' }, { value: '360281', label: '乐平市' },
      ]},
      { value: '360400', label: '九江市', children: [
        { value: '360402', label: '濂溪区' }, { value: '360403', label: '浔阳区' },
        { value: '360404', label: '柴桑区' }, { value: '360423', label: '武宁县' },
        { value: '360424', label: '修水县' }, { value: '360425', label: '永修县' },
        { value: '360426', label: '德安县' }, { value: '360428', label: '都昌县' },
        { value: '360429', label: '湖口县' }, { value: '360430', label: '彭泽县' },
        { value: '360481', label: '瑞昌市' }, { value: '360482', label: '共青城市' },
        { value: '360483', label: '庐山市' },
      ]},
    ]
  },
  {
    value: '370000', label: '山东省', children: [
      { value: '370100', label: '济南市', children: [
        { value: '370102', label: '历下区' }, { value: '370103', label: '市中区' },
        { value: '370104', label: '槐荫区' }, { value: '370105', label: '天桥区' },
        { value: '370112', label: '历城区' }, { value: '370113', label: '长清区' },
        { value: '370114', label: '章丘区' },
      ]},
      { value: '370200', label: '青岛市', children: [
        { value: '370202', label: '市南区' }, { value: '370203', label: '市北区' },
        { value: '370211', label: '黄岛区' }, { value: '370212', label: '崂山区' },
        { value: '370213', label: '李沧区' }, { value: '370214', label: '城阳区' },
        { value: '370215', label: '即墨区' },
      ]},
      { value: '370300', label: '淄博市', children: [
        { value: '370302', label: '淄川区' }, { value: '370303', label: '张店区' },
      ]},
      { value: '370400', label: '枣庄市', children: [
        { value: '370402', label: '市中区' }, { value: '370403', label: '薛城区' },
      ]},
      { value: '370500', label: '东营市', children: [
        { value: '370502', label: '东营区' }, { value: '370503', label: '河口区' },
      ]},
      { value: '370600', label: '烟台市', children: [
        { value: '370602', label: '芝罘区' }, { value: '370611', label: '福山区' },
        { value: '370612', label: '牟平区' }, { value: '370613', label: '莱山区' },
      ]},
      { value: '370700', label: '潍坊市', children: [
        { value: '370702', label: '潍城区' }, { value: '370703', label: '寒亭区' },
        { value: '370704', label: '坊子区' }, { value: '370705', label: '奎文区' },
      ]},
      { value: '370800', label: '济宁市', children: [
        { value: '370811', label: '任城区' },
      ]},
      { value: '370900', label: '泰安市', children: [
        { value: '370902', label: '泰山区' }, { value: '370911', label: '岱岳区' },
      ]},
      { value: '371000', label: '威海市', children: [
        { value: '371002', label: '环翠区' }, { value: '371003', label: '文登区' },
      ]},
      { value: '371100', label: '日照市', children: [
        { value: '371102', label: '东港区' }, { value: '371103', label: '岚山区' },
      ]},
      { value: '371300', label: '临沂市', children: [
        { value: '371302', label: '兰山区' }, { value: '371311', label: '罗庄区' },
        { value: '371312', label: '河东区' },
      ]},
      { value: '371400', label: '德州市', children: [
        { value: '371402', label: '德城区' },
      ]},
    ]
  },
  {
    value: '410000', label: '河南省', children: [
      { value: '410100', label: '郑州市', children: [
        { value: '410102', label: '中原区' }, { value: '410103', label: '二七区' },
        { value: '410104', label: '管城回族区' }, { value: '410105', label: '金水区' },
        { value: '410106', label: '上街区' }, { value: '410108', label: '惠济区' },
        { value: '410122', label: '中牟县' }, { value: '410181', label: '巩义市' },
        { value: '410182', label: '荥阳市' }, { value: '410183', label: '新密市' },
        { value: '410184', label: '新郑市' }, { value: '410185', label: '登封市' },
      ]},
      { value: '410200', label: '开封市', children: [
        { value: '410202', label: '龙亭区' }, { value: '410203', label: '顺河回族区' },
        { value: '410204', label: '鼓楼区' }, { value: '410205', label: '禹王台区' },
        { value: '410212', label: '祥符区' }, { value: '410221', label: '杞县' },
        { value: '410222', label: '通许县' }, { value: '410223', label: '尉氏县' },
        { value: '410225', label: '兰考县' },
      ]},
      { value: '410300', label: '洛阳市', children: [
        { value: '410302', label: '老城区' }, { value: '410303', label: '西工区' },
        { value: '410304', label: '瀍河回族区' }, { value: '410305', label: '涧西区' },
        { value: '410311', label: '洛龙区' }, { value: '410322', label: '孟津区' },
        { value: '410323', label: '新安县' }, { value: '410324', label: '栾川县' },
        { value: '410325', label: '嵩县' }, { value: '410326', label: '汝阳县' },
        { value: '410327', label: '宜阳县' }, { value: '410328', label: '洛宁县' },
        { value: '410329', label: '伊川县' }, { value: '410381', label: '偃师区' },
      ]},
      { value: '410400', label: '平顶山市', children: [
        { value: '410402', label: '新华区' }, { value: '410403', label: '卫东区' },
        { value: '410411', label: '湛河区' }, { value: '410421', label: '宝丰县' },
        { value: '410422', label: '叶县' }, { value: '410423', label: '鲁山县' },
        { value: '410425', label: '郏县' }, { value: '410481', label: '舞钢市' },
        { value: '410482', label: '汝州市' },
      ]},
      { value: '410500', label: '安阳市', children: [
        { value: '410502', label: '文峰区' }, { value: '410503', label: '北关区' },
        { value: '410505', label: '殷都区' }, { value: '410506', label: '龙安区' },
        { value: '410522', label: '安阳县' }, { value: '410523', label: '汤阴县' },
        { value: '410526', label: '滑县' }, { value: '410527', label: '内黄县' },
        { value: '410581', label: '林州市' },
      ]},
    ]
  },
  {
    value: '420000', label: '湖北省', children: [
      { value: '420100', label: '武汉市', children: [
        { value: '420102', label: '江岸区' }, { value: '420103', label: '江汉区' },
        { value: '420104', label: '硚口区' }, { value: '420105', label: '汉阳区' },
        { value: '420106', label: '武昌区' }, { value: '420107', label: '青山区' },
        { value: '420111', label: '洪山区' }, { value: '420112', label: '东西湖区' },
        { value: '420113', label: '汉南区' }, { value: '420114', label: '蔡甸区' },
        { value: '420115', label: '江夏区' }, { value: '420116', label: '黄陂区' },
        { value: '420117', label: '新洲区' },
      ]},
      { value: '420200', label: '黄石市', children: [
        { value: '420202', label: '黄石港区' }, { value: '420203', label: '西塞山区' },
      ]},
      { value: '420500', label: '宜昌市', children: [
        { value: '420502', label: '西陵区' }, { value: '420503', label: '伍家岗区' },
      ]},
      { value: '420600', label: '襄阳市', children: [
        { value: '420602', label: '襄城区' }, { value: '420606', label: '樊城区' },
        { value: '420607', label: '襄州区' },
      ]},
    ]
  },
  {
    value: '430000', label: '湖南省', children: [
      { value: '430100', label: '长沙市', children: [
        { value: '430102', label: '芙蓉区' }, { value: '430103', label: '天心区' },
        { value: '430104', label: '岳麓区' }, { value: '430105', label: '开福区' },
        { value: '430111', label: '雨花区' }, { value: '430112', label: '望城区' },
      ]},
      { value: '430200', label: '株洲市', children: [
        { value: '430202', label: '荷塘区' }, { value: '430203', label: '芦淞区' },
        { value: '430204', label: '石峰区' }, { value: '430211', label: '天元区' },
      ]},
      { value: '430300', label: '湘潭市', children: [
        { value: '430302', label: '雨湖区' }, { value: '430304', label: '岳塘区' },
      ]},
      { value: '430400', label: '衡阳市', children: [
        { value: '430405', label: '珠晖区' }, { value: '430406', label: '雁峰区' },
        { value: '430407', label: '石鼓区' }, { value: '430408', label: '蒸湘区' },
      ]},
    ]
  },
  {
    value: '440000', label: '广东省', children: [
      { value: '440100', label: '广州市', children: [
        { value: '440103', label: '荔湾区' }, { value: '440104', label: '越秀区' },
        { value: '440105', label: '海珠区' }, { value: '440106', label: '天河区' },
        { value: '440111', label: '白云区' }, { value: '440112', label: '黄埔区' },
        { value: '440113', label: '番禺区' }, { value: '440114', label: '花都区' },
        { value: '440115', label: '南沙区' }, { value: '440117', label: '从化区' },
        { value: '440118', label: '增城区' },
      ]},
      { value: '440200', label: '韶关市', children: [
        { value: '440203', label: '武江区' }, { value: '440204', label: '浈江区' },
        { value: '440205', label: '曲江区' },
      ]},
      { value: '440300', label: '深圳市', children: [
        { value: '440303', label: '罗湖区' }, { value: '440304', label: '福田区' },
        { value: '440305', label: '南山区' }, { value: '440306', label: '宝安区' },
        { value: '440307', label: '龙岗区' }, { value: '440308', label: '盐田区' },
        { value: '440309', label: '龙华区' }, { value: '440310', label: '坪山区' },
        { value: '440311', label: '光明区' },
      ]},
      { value: '440400', label: '珠海市', children: [
        { value: '440402', label: '香洲区' }, { value: '440403', label: '斗门区' },
        { value: '440404', label: '金湾区' },
      ]},
      { value: '440500', label: '汕头市', children: [
        { value: '440507', label: '龙湖区' }, { value: '440511', label: '金平区' },
      ]},
      { value: '440600', label: '佛山市', children: [
        { value: '440604', label: '禅城区' }, { value: '440605', label: '南海区' },
        { value: '440606', label: '顺德区' }, { value: '440607', label: '三水区' },
        { value: '440608', label: '高明区' },
      ]},
      { value: '440700', label: '江门市', children: [
        { value: '440703', label: '蓬江区' }, { value: '440704', label: '江海区' },
        { value: '440705', label: '新会区' },
      ]},
      { value: '440800', label: '湛江市', children: [
        { value: '440802', label: '赤坎区' }, { value: '440803', label: '霞山区' },
      ]},
      { value: '441900', label: '东莞市', children: [
        { value: '441901', label: '东莞市' },
      ]},
      { value: '442000', label: '中山市', children: [
        { value: '442001', label: '中山市' },
      ]},
      { value: '445100', label: '潮州市', children: [
        { value: '445102', label: '湘桥区' },
      ]},
    ]
  },
  {
    value: '450000', label: '广西壮族自治区', children: [
      { value: '450100', label: '南宁市', children: [
        { value: '450102', label: '兴宁区' }, { value: '450103', label: '青秀区' },
        { value: '450105', label: '江南区' }, { value: '450107', label: '西乡塘区' },
        { value: '450108', label: '良庆区' }, { value: '450109', label: '邕宁区' },
      ]},
      { value: '450200', label: '柳州市', children: [
        { value: '450202', label: '城中区' }, { value: '450203', label: '鱼峰区' },
        { value: '450204', label: '柳南区' }, { value: '450205', label: '柳北区' },
      ]},
      { value: '450300', label: '桂林市', children: [
        { value: '450302', label: '秀峰区' }, { value: '450303', label: '叠彩区' },
        { value: '450304', label: '象山区' }, { value: '450305', label: '七星区' },
      ]},
      { value: '450500', label: '北海市', children: [
        { value: '450502', label: '海城区' }, { value: '450503', label: '银海区' },
      ]},
    ]
  },
  {
    value: '460000', label: '海南省', children: [
      { value: '460100', label: '海口市', children: [
        { value: '460105', label: '秀英区' }, { value: '460106', label: '龙华区' },
        { value: '460107', label: '琼山区' }, { value: '460108', label: '美兰区' },
      ]},
      { value: '460200', label: '三亚市', children: [
        { value: '460202', label: '海棠区' }, { value: '460203', label: '吉阳区' },
        { value: '460204', label: '天涯区' }, { value: '460205', label: '崖州区' },
      ]},
    ]
  },
  {
    value: '500000', label: '重庆市', children: [
      { value: '500100', label: '重庆市', children: [
        { value: '500101', label: '万州区' }, { value: '500102', label: '涪陵区' },
        { value: '500103', label: '渝中区' }, { value: '500104', label: '大渡口区' },
        { value: '500105', label: '江北区' }, { value: '500106', label: '沙坪坝区' },
        { value: '500107', label: '九龙坡区' }, { value: '500108', label: '南岸区' },
        { value: '500109', label: '北碚区' }, { value: '500110', label: '綦江区' },
        { value: '500111', label: '大足区' }, { value: '500112', label: '渝北区' },
        { value: '500113', label: '巴南区' }, { value: '500114', label: '黔江区' },
        { value: '500115', label: '长寿区' }, { value: '500116', label: '江津区' },
        { value: '500117', label: '合川区' }, { value: '500118', label: '永川区' },
        { value: '500119', label: '南川区' },
      ]}
    ]
  },
  {
    value: '510000', label: '四川省', children: [
      { value: '510100', label: '成都市', children: [
        { value: '510104', label: '锦江区' }, { value: '510105', label: '青羊区' },
        { value: '510106', label: '金牛区' }, { value: '510107', label: '武侯区' },
        { value: '510108', label: '成华区' }, { value: '510112', label: '龙泉驿区' },
        { value: '510113', label: '青白江区' }, { value: '510114', label: '新都区' },
        { value: '510115', label: '温江区' }, { value: '510116', label: '双流区' },
        { value: '510117', label: '郫都区' }, { value: '510118', label: '新津区' },
        { value: '510121', label: '金堂县' }, { value: '510129', label: '大邑县' },
        { value: '510131', label: '蒲江县' }, { value: '510181', label: '都江堰市' },
        { value: '510182', label: '彭州市' }, { value: '510183', label: '邛崃市' },
        { value: '510184', label: '崇州市' }, { value: '510185', label: '简阳市' },
      ]},
      { value: '510300', label: '自贡市', children: [
        { value: '510302', label: '自流井区' }, { value: '510303', label: '贡井区' },
        { value: '510304', label: '大安区' }, { value: '510311', label: '沿滩区' },
        { value: '510321', label: '荣县' }, { value: '510322', label: '富顺县' },
      ]},
      { value: '510400', label: '攀枝花市', children: [
        { value: '510402', label: '东区' }, { value: '510403', label: '西区' },
        { value: '510411', label: '仁和区' }, { value: '510421', label: '米易县' },
        { value: '510422', label: '盐边县' },
      ]},
      { value: '510500', label: '泸州市', children: [
        { value: '510502', label: '江阳区' }, { value: '510503', label: '纳溪区' },
        { value: '510504', label: '龙马潭区' }, { value: '510521', label: '泸县' },
        { value: '510522', label: '合江县' }, { value: '510524', label: '叙永县' },
        { value: '510525', label: '古蔺县' },
      ]},
      { value: '510600', label: '德阳市', children: [
        { value: '510603', label: '旌阳区' }, { value: '510604', label: '罗江区' },
        { value: '510623', label: '中江县' }, { value: '510681', label: '广汉市' },
        { value: '510682', label: '什邡市' }, { value: '510683', label: '绵竹市' },
      ]},
      { value: '510700', label: '绵阳市', children: [
        { value: '510703', label: '涪城区' }, { value: '510704', label: '游仙区' },
        { value: '510705', label: '安州区' }, { value: '510722', label: '三台县' },
        { value: '510723', label: '盐亭县' }, { value: '510725', label: '梓潼县' },
        { value: '510726', label: '北川羌族自治县' }, { value: '510727', label: '平武县' },
        { value: '510781', label: '江油市' },
      ]},
      { value: '511300', label: '南充市', children: [
        { value: '511302', label: '顺庆区' }, { value: '511303', label: '高坪区' },
        { value: '511304', label: '嘉陵区' }, { value: '511321', label: '南部县' },
        { value: '511322', label: '营山县' }, { value: '511323', label: '蓬安县' },
        { value: '511324', label: '仪陇县' }, { value: '511325', label: '西充县' },
        { value: '511381', label: '阆中市' },
      ]},
    ]
  },
  {
    value: '520000', label: '贵州省', children: [
      { value: '520100', label: '贵阳市', children: [
        { value: '520102', label: '南明区' }, { value: '520103', label: '云岩区' },
        { value: '520111', label: '花溪区' }, { value: '520112', label: '乌当区' },
        { value: '520113', label: '白云区' }, { value: '520115', label: '观山湖区' },
      ]},
      { value: '520200', label: '六盘水市', children: [
        { value: '520201', label: '钟山区' },
      ]},
      { value: '520300', label: '遵义市', children: [
        { value: '520302', label: '红花岗区' }, { value: '520303', label: '汇川区' },
      ]},
    ]
  },
  {
    value: '530000', label: '云南省', children: [
      { value: '530100', label: '昆明市', children: [
        { value: '530102', label: '五华区' }, { value: '530103', label: '盘龙区' },
        { value: '530111', label: '官渡区' }, { value: '530112', label: '西山区' },
        { value: '530113', label: '东川区' }, { value: '530114', label: '呈贡区' },
      ]},
      { value: '530400', label: '玉溪市', children: [
        { value: '530402', label: '红塔区' },
      ]},
      { value: '532900', label: '大理白族自治州', children: [
        { value: '532901', label: '大理市' },
      ]},
      { value: '533100', label: '丽江市', children: [
        { value: '533102', label: '古城区' },
      ]},
    ]
  },
  {
    value: '540000', label: '西藏自治区', children: [
      { value: '540100', label: '拉萨市', children: [
        { value: '540102', label: '城关区' },
      ]},
    ]
  },
  {
    value: '610000', label: '陕西省', children: [
      { value: '610100', label: '西安市', children: [
        { value: '610102', label: '新城区' }, { value: '610103', label: '碑林区' },
        { value: '610104', label: '莲湖区' }, { value: '610111', label: '灞桥区' },
        { value: '610112', label: '未央区' }, { value: '610113', label: '雁塔区' },
        { value: '610114', label: '阎良区' }, { value: '610115', label: '临潼区' },
        { value: '610116', label: '长安区' },
      ]},
      { value: '610200', label: '铜川市', children: [
        { value: '610202', label: '王益区' }, { value: '610203', label: '印台区' },
      ]},
      { value: '610300', label: '宝鸡市', children: [
        { value: '610302', label: '渭滨区' }, { value: '610303', label: '金台区' },
      ]},
      { value: '610400', label: '咸阳市', children: [
        { value: '610402', label: '秦都区' }, { value: '610403', label: '杨陵区' },
        { value: '610404', label: '渭城区' },
      ]},
    ]
  },
  {
    value: '620000', label: '甘肃省', children: [
      { value: '620100', label: '兰州市', children: [
        { value: '620102', label: '城关区' }, { value: '620103', label: '七里河区' },
        { value: '620104', label: '西固区' }, { value: '620105', label: '安宁区' },
        { value: '620111', label: '红古区' },
      ]},
    ]
  },
  {
    value: '630000', label: '青海省', children: [
      { value: '630100', label: '西宁市', children: [
        { value: '630102', label: '城东区' }, { value: '630103', label: '城中区' },
        { value: '630104', label: '城西区' }, { value: '630105', label: '城北区' },
      ]},
    ]
  },
  {
    value: '640000', label: '宁夏回族自治区', children: [
      { value: '640100', label: '银川市', children: [
        { value: '640104', label: '兴庆区' }, { value: '640105', label: '西夏区' },
        { value: '640106', label: '金凤区' },
      ]},
    ]
  },
  {
    value: '650000', label: '新疆维吾尔自治区', children: [
      { value: '650100', label: '乌鲁木齐市', children: [
        { value: '650102', label: '天山区' }, { value: '650103', label: '沙依巴克区' },
        { value: '650104', label: '新市区' }, { value: '650105', label: '水磨沟区' },
        { value: '650106', label: '头屯河区' },
      ]},
    ]
  },
  {
    value: '710000', label: '台湾省', children: [
      { value: '710100', label: '台北市', children: [{ value: '710101', label: '台北市' }] },
    ]
  },
  {
    value: '810000', label: '香港特别行政区', children: [
      { value: '810100', label: '香港', children: [{ value: '810101', label: '香港' }] },
    ]
  },
  {
    value: '820000', label: '澳门特别行政区', children: [
      { value: '820100', label: '澳门', children: [{ value: '820101', label: '澳门' }] },
    ]
  },
]

/**
 * 根据 value 查找名称（用于回显）
 */
export function findRegionName(value) {
  for (const p of regions) {
    if (p.value === value) return { province: p.label }
    for (const c of p.children || []) {
      if (c.value === value) return { province: p.label, city: c.label }
      for (const d of c.children || []) {
        if (d.value === value) return { province: p.label, city: c.label, district: d.label }
      }
    }
  }
  return {}
}
