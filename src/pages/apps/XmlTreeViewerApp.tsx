import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FileCode,
  Upload,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  Info,
  Flame,
  Code,
  ListTree,
  Table,
  BarChart3,
  Sun,
  Moon,
  X,
  Target,
  Layers,
  Box,
  FileSpreadsheet,
  Building2,
  FolderTree,
  ExternalLink,
  Maximize2
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface XmlTreeNode {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  textContent?: string;
  children: XmlTreeNode[];
  depth: number;
  parentPath: string;
  fullPath: string;
  elementCount: number; // descendant element count
  isPredominant?: boolean;
  isMainKey?: boolean;
}

export interface VisibleFlatNode {
  node: XmlTreeNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isMatched: boolean;
  isPredominant: boolean;
  isMainKey: boolean;
}

export interface XmlInitialValue {
  key: string;
  value: string;
  category: 'prolog' | 'root_attr' | 'header_node';
}

export interface TagFrequency {
  tagName: string;
  count: number;
  percentage: number;
  isPredominant: boolean;
  isMainKey: boolean;
}

export interface TeklaHeaderSummary {
  version?: string;
  sourceApp?: string;
  sourceAppVersion?: string;
  pluginVersion?: string;
  fileCreationDate?: string;
  companyName?: string;
  projectNumber?: string;
  projectName?: string;
  cncDirectory?: string;
  drawingDirectory?: string;
  totalAssemblyDrawings: number;
  totalGADrawings: number;
  totalExcludedDrawings: number;
  totalAssemblies: number;
}

export interface ExtractedTeklaDrawing {
  id: string;
  drawingNumber: string;
  drawingTitle: string;
  category: string;
  dateDetailed: string;
  revisionNumber: string;
  revisionDescription: string;
  dateRevised: string;
  modelRef: string;
  rawXml: string;
  rawFields: Record<string, string>;
}

export interface ExtractedTeklaAssemblyPart {
  partMark: string;
  partProfile: string;
  quantity: number;
  length: string;
  weight: string;
  materialGrade: string;
  finish: string;
}

export interface ExtractedTeklaAssembly {
  id: string;
  assemblyMark: string;
  mainPartMark: string;
  mainPartProfile: string;
  quantity: number;
  lengthInches: string;
  weightLbs: string;
  partsCount: number;
  parts: ExtractedTeklaAssemblyPart[];
  rawXml: string;
  rawFields: Record<string, string>;
}

// ==========================================
// SAMPLE XML GENERATORS
// ==========================================
const SAMPLES = {
  teklaPowerFab: `<?xml version="1.0" encoding="utf-8"?>
<FabSuiteDataExchange xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.fabsuite.com/XML_Schemas/TeklaPowerFabDataFile0109.xsd">
  <FabSuiteDataExchangeVersion>1.09</FabSuiteDataExchangeVersion>
  <FileSourceData>
    <SourceApplication>Tekla Structures</SourceApplication>
    <SourceApplicationVersion>2023 Service Pack 13</SourceApplicationVersion>
    <PluginVersion>6.7.0.0</PluginVersion>
    <FileCreationDate>2026-11-06</FileCreationDate>
    <CompanyData>
      <CompanyName>Tekla Structures 2023 Service Pack 13</CompanyName>
    </CompanyData>
  </FileSourceData>
  <ProjectData>
    <ContractData>
      <ProjectId>
        <ProjectNumber>26066</ProjectNumber>
        <ProjectName>TCA PHASE II - HIGH SCHOOL + GYM ADDITIONS</ProjectName>
      </ProjectId>
      <ProjectFiles>
        <CNCDirectory>\\CNC</CNCDirectory>
        <CNCFileExtension>nc1</CNCFileExtension>
        <DrawingDirectory>\\Drawings</DrawingDirectory>
      </ProjectFiles>
      <DrawingData>
        <Drawing>
          <DrawingNumber>MC1047</DrawingNumber>
          <DrawingTitle>RTU CHANNEL</DrawingTitle>
          <DateDetailed>2026-10-12</DateDetailed>
          <Category>Assembly</Category>
          <DrawingRevision>
            <RevisionNumber>0</RevisionNumber>
            <RevisionDescription>For Fabrication</RevisionDescription>
            <DateRevised>2026-11-06</DateRevised>
          </DrawingRevision>
          <ModelRef>2facbb6f-9958-a7b6-f441-8c372103ae40</ModelRef>
        </Drawing>
        <Drawing>
          <DrawingNumber>MC1057</DrawingNumber>
          <DrawingTitle>SHROUD ANGLE</DrawingTitle>
          <DateDetailed>2026-10-12</DateDetailed>
          <Category>Assembly</Category>
          <DrawingRevision>
            <RevisionNumber>0</RevisionNumber>
            <RevisionDescription>For Fabrication</RevisionDescription>
            <DateRevised>2026-11-06</DateRevised>
          </DrawingRevision>
          <ModelRef>1d636487-ca75-df80-d74b-68ee20734cf2</ModelRef>
        </Drawing>
        <Drawing>
          <DrawingNumber>E1007</DrawingNumber>
          <DrawingTitle>RTU PLAN</DrawingTitle>
          <DateDetailed>2026-10-12</DateDetailed>
          <Category>General Arrangement</Category>
          <DrawingRevision>
            <RevisionNumber>0</RevisionNumber>
            <RevisionDescription>For Field Use</RevisionDescription>
            <DateRevised>2026-11-06</DateRevised>
          </DrawingRevision>
          <ModelRef>c70ad426-5334-9bda-871f-bb0df0f428ee</ModelRef>
        </Drawing>
      </DrawingData>
      <AssemblyData>
        <Assembly>
          <AssemblyMark>MC1047</AssemblyMark>
          <Quantity>2</Quantity>
          <AssemblyMainPart>
            <MainPartMark>m1047</MainPartMark>
            <MainPartProfile>C8X11.5</MainPartProfile>
            <Length>144.5</Length>
            <Weight>138.5</Weight>
          </AssemblyMainPart>
          <AssemblyParts>
            <AssemblyPart>
              <PartMark>p101</PartMark>
              <PartProfile>PL3/8X6</PartProfile>
              <Quantity>4</Quantity>
              <Length>12.0</Length>
              <Weight>8.5</Weight>
              <Grade>A36</Grade>
            </AssemblyPart>
          </AssemblyParts>
        </Assembly>
        <Assembly>
          <AssemblyMark>MC1057</AssemblyMark>
          <Quantity>4</Quantity>
          <AssemblyMainPart>
            <MainPartMark>m1057</MainPartMark>
            <MainPartProfile>L3X3X1/4</MainPartProfile>
            <Length>72.0</Length>
            <Weight>35.4</Weight>
          </AssemblyMainPart>
          <AssemblyParts>
            <AssemblyPart>
              <PartMark>p102</PartMark>
              <PartProfile>PL1/4X4</PartProfile>
              <Quantity>2</Quantity>
              <Length>6.5</Length>
              <Weight>2.1</Weight>
              <Grade>A36</Grade>
            </AssemblyPart>
          </AssemblyParts>
        </Assembly>
      </AssemblyData>
    </ContractData>
  </ProjectData>
</FabSuiteDataExchange>`,

  transmittal: `<?xml version="1.0" encoding="UTF-8"?>
<TransmittalPackage version="2.4" projectNo="4250" created="2026-11-06" company="LIBERTY STEEL FABRICATION, INC" location="Fyffe, AL">
  <Header>
    <TransmittalNo>01</TransmittalNo>
    <CustomerName>LIBERTY STEEL FABRICATION, INC</CustomerName>
    <ProjectName>VILLAGE AT BROOKWOOD</ProjectName>
    <Attention>Steven Mitchell</Attention>
    <DeliveryMethod>email</DeliveryMethod>
    <Purpose>Approval</Purpose>
    <SystemConfig mode="strict" autoWrap="true" maxLineWidth="78" />
  </Header>
  <DrawingData totalSheets="47">
    <Drawing category="Assembly">
      <Sheet number="102" revision="Rev A" status="Approved" weightLbs="420" />
      <Sheet number="103" revision="Rev A" status="Approved" weightLbs="380" />
      <Sheet number="104" revision="Rev A" status="Approved" weightLbs="510" />
    </Drawing>
  </DrawingData>
  <AssemblyData count="39">
    <Assembly mark="A102" profile="W12X26" length="240.0" />
    <Assembly mark="A103" profile="W14X30" length="288.0" />
  </AssemblyData>
</TransmittalPackage>`,

  config: `<?xml version="1.0" encoding="UTF-8"?>
<WorkspaceConfig environment="production" schemaVersion="3.1.0" buildNumber="8921">
  <SystemProlog>
    <AppName>Tekla PowerFab Precision Viewer</AppName>
    <Author>Tekla Integration Team</Author>
  </SystemProlog>
  <DrawingData>
    <Drawing id="d1" name="Roof Plan" />
  </DrawingData>
  <AssemblyData>
    <Assembly id="a1" mark="B101" />
  </AssemblyData>
</WorkspaceConfig>`
};

const MAIN_KEY_TAGS = new Set([
  'AssemblyData',
  'DrawingData',
  'Assembly',
  'Drawing',
  'AssemblyDrawing',
  'GADrawing',
  'ExcludedDrawing',
  'PartDrawing',
  'AssemblyMainPart',
  'AssemblyPart',
  'AssemblyParts',
  'AssemblyDrawings',
  'GADrawings',
  'ExcludedDrawings',
  'PartDrawings'
]);

// ==========================================
// HELPER: PARSE XML TO TREE & EXTRACT METADATA
// ==========================================
function parseXmlToTree(xmlString: string): {
  rootNode: XmlTreeNode | null;
  initialValues: XmlInitialValue[];
  tagFrequencies: TagFrequency[];
  totalNodeCount: number;
  maxDepth: number;
  headerSummary: TeklaHeaderSummary;
  drawings: ExtractedTeklaDrawing[];
  assemblies: ExtractedTeklaAssembly[];
  error: string | null;
} {
  const initialValues: XmlInitialValue[] = [];
  let error: string | null = null;

  const prologMatch = xmlString.match(/<\?xml([^>]+)\?>/i);
  if (prologMatch) {
    const prologAttrs = prologMatch[1].trim();
    initialValues.push({
      key: 'XML Declaration',
      value: `<?xml ${prologAttrs} ?>`,
      category: 'prolog',
    });
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    error = parserError.textContent || 'Invalid XML structure';
    return {
      rootNode: null,
      initialValues: [],
      tagFrequencies: [],
      totalNodeCount: 0,
      maxDepth: 0,
      headerSummary: {
        totalAssemblyDrawings: 0,
        totalGADrawings: 0,
        totalExcludedDrawings: 0,
        totalAssemblies: 0,
      },
      drawings: [],
      assemblies: [],
      error,
    };
  }

  const rootElement = doc.documentElement;
  if (!rootElement) {
    return {
      rootNode: null,
      initialValues: [],
      tagFrequencies: [],
      totalNodeCount: 0,
      maxDepth: 0,
      headerSummary: {
        totalAssemblyDrawings: 0,
        totalGADrawings: 0,
        totalExcludedDrawings: 0,
        totalAssemblies: 0,
      },
      drawings: [],
      assemblies: [],
      error: 'Empty XML document',
    };
  }

  if (rootElement.attributes.length > 0) {
    for (let i = 0; i < rootElement.attributes.length; i++) {
      const attr = rootElement.attributes[i];
      initialValues.push({
        key: `<${rootElement.tagName}> @${attr.name}`,
        value: attr.value,
        category: 'root_attr',
      });
    }
  }

  const getText = (selector: string) => doc.querySelector(selector)?.textContent?.trim() || '';

  const version = getText('FabSuiteDataExchangeVersion');
  const sourceApp = getText('SourceApplication');
  const sourceAppVersion = getText('SourceApplicationVersion');
  const pluginVersion = getText('PluginVersion');
  const fileCreationDate = getText('FileCreationDate');
  const companyName = getText('CompanyName');
  const projectNumber = getText('ProjectNumber');
  const projectName = getText('ProjectName');
  const cncDirectory = getText('CNCDirectory');
  const drawingDirectory = getText('DrawingDirectory');

  const drawingNodes = doc.querySelectorAll('DrawingData Drawing, DrawingData AssemblyDrawing');
  const assemblyNodes = doc.querySelectorAll('AssemblyData Assembly');
  const gaNodes = doc.querySelectorAll('DrawingData GADrawings GADrawing');
  const excludedNodes = doc.querySelectorAll('DrawingData ExcludedDrawings ExcludedDrawing');

  const headerSummary: TeklaHeaderSummary = {
    version,
    sourceApp,
    sourceAppVersion,
    pluginVersion,
    fileCreationDate,
    companyName,
    projectNumber,
    projectName,
    cncDirectory,
    drawingDirectory,
    totalAssemblyDrawings: drawingNodes.length,
    totalGADrawings: gaNodes.length,
    totalExcludedDrawings: excludedNodes.length,
    totalAssemblies: assemblyNodes.length,
  };

  if (version) initialValues.push({ key: 'FabSuite Version', value: version, category: 'header_node' });
  if (sourceApp) initialValues.push({ key: 'Source Application', value: `${sourceApp} ${sourceAppVersion}`.trim(), category: 'header_node' });
  if (companyName) initialValues.push({ key: 'Company Name', value: companyName, category: 'header_node' });
  if (projectNumber) initialValues.push({ key: 'Project #', value: projectNumber, category: 'header_node' });
  if (projectName) initialValues.push({ key: 'Project Name', value: projectName, category: 'header_node' });
  if (fileCreationDate) initialValues.push({ key: 'File Creation Date', value: fileCreationDate, category: 'header_node' });

  // Extract Drawings
  const drawings: ExtractedTeklaDrawing[] = [];
  const drawingElements = doc.querySelectorAll('DrawingData > Drawing, DrawingData > AssemblyDrawings > AssemblyDrawing, DrawingData > GADrawings > GADrawing, DrawingData > ExcludedDrawings > ExcludedDrawing');
  
  drawingElements.forEach((el, idx) => {
    const rawFields: Record<string, string> = {};
    Array.from(el.children).forEach((child) => {
      if (child.children.length === 0 && child.textContent?.trim()) {
        rawFields[child.tagName] = child.textContent.trim();
      }
    });

    drawings.push({
      id: `dwg_${idx}_${el.querySelector('DrawingNumber')?.textContent?.trim() || idx}`,
      drawingNumber: el.querySelector('DrawingNumber')?.textContent?.trim() || 'N/A',
      drawingTitle: el.querySelector('DrawingTitle')?.textContent?.trim() || 'N/A',
      category: el.querySelector('Category')?.textContent?.trim() || 'Assembly',
      dateDetailed: el.querySelector('DateDetailed')?.textContent?.trim() || '',
      revisionNumber: el.querySelector('DrawingRevision > RevisionNumber')?.textContent?.trim() || '0',
      revisionDescription: el.querySelector('DrawingRevision > RevisionDescription')?.textContent?.trim() || '',
      dateRevised: el.querySelector('DrawingRevision > DateRevised')?.textContent?.trim() || '',
      modelRef: el.querySelector('ModelRef')?.textContent?.trim() || '',
      rawXml: new XMLSerializer().serializeToString(el),
      rawFields,
    });
  });

  // Extract Assemblies
  const assemblies: ExtractedTeklaAssembly[] = [];
  const assemblyElements = doc.querySelectorAll('AssemblyData > Assembly');
  
  assemblyElements.forEach((el, idx) => {
    const mainPart = el.querySelector('AssemblyMainPart');
    const parts: ExtractedTeklaAssemblyPart[] = [];

    el.querySelectorAll('AssemblyParts > AssemblyPart, AssemblyPart').forEach((partEl) => {
      parts.push({
        partMark: partEl.querySelector('PartMark, MainPartMark')?.textContent?.trim() || 'N/A',
        partProfile: partEl.querySelector('PartProfile, MainPartProfile')?.textContent?.trim() || 'N/A',
        quantity: parseInt(partEl.querySelector('Quantity')?.textContent?.trim() || '1', 10),
        length: partEl.querySelector('Length')?.textContent?.trim() || '0',
        weight: partEl.querySelector('Weight')?.textContent?.trim() || '0',
        materialGrade: partEl.querySelector('Grade, MaterialGrade')?.textContent?.trim() || 'A36',
        finish: partEl.querySelector('Finish')?.textContent?.trim() || 'None',
      });
    });

    const rawFields: Record<string, string> = {};
    Array.from(el.children).forEach((child) => {
      if (child.children.length === 0 && child.textContent?.trim()) {
        rawFields[child.tagName] = child.textContent.trim();
      }
    });

    assemblies.push({
      id: `asm_${idx}_${el.querySelector('AssemblyMark')?.textContent?.trim() || idx}`,
      assemblyMark: el.querySelector('AssemblyMark')?.textContent?.trim() || 'N/A',
      mainPartMark: mainPart?.querySelector('MainPartMark')?.textContent?.trim() || 'N/A',
      mainPartProfile: mainPart?.querySelector('MainPartProfile')?.textContent?.trim() || 'N/A',
      quantity: parseInt(el.querySelector('Quantity')?.textContent?.trim() || '1', 10),
      lengthInches: mainPart?.querySelector('Length')?.textContent?.trim() || '0',
      weightLbs: mainPart?.querySelector('Weight')?.textContent?.trim() || '0',
      partsCount: parts.length,
      parts,
      rawXml: new XMLSerializer().serializeToString(el),
      rawFields,
    });
  });

  const tagCounts: Record<string, number> = {};
  let totalNodes = 0;
  let maxDepthObserved = 1;
  let idCounter = 1;

  function processElement(
    elem: Element,
    depth = 1,
    parentPath = ''
  ): XmlTreeNode {
    totalNodes++;
    if (depth > maxDepthObserved) maxDepthObserved = depth;

    const tagName = elem.tagName;
    tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;

    const currentId = `node_${idCounter++}`;
    const fullPath = parentPath ? `${parentPath}/${tagName}` : `/${tagName}`;
    const isMainKey = MAIN_KEY_TAGS.has(tagName) || fullPath.includes('AssemblyData') || fullPath.includes('DrawingData');

    const attributes: Record<string, string> = {};
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      attributes[attr.name] = attr.value;
    }

    const children: XmlTreeNode[] = [];
    let childDescendantCount = 0;

    const childElements = Array.from(elem.children);
    childElements.forEach((childElem) => {
      const childNode = processElement(childElem, depth + 1, fullPath);
      children.push(childNode);
      childDescendantCount += 1 + childNode.elementCount;
    });

    let textContent: string | undefined;
    if (children.length === 0) {
      const txt = elem.textContent?.trim();
      if (txt) {
        textContent = txt;
      }
    }

    return {
      id: currentId,
      tagName,
      attributes,
      textContent,
      children,
      depth,
      parentPath,
      fullPath,
      elementCount: childDescendantCount,
      isMainKey,
    };
  }

  const rootNode = processElement(rootElement, 1, '');

  const tagFrequencies: TagFrequency[] = Object.entries(tagCounts)
    .map(([tagName, count]) => ({
      tagName,
      count,
      percentage: Math.round((count / totalNodes) * 100),
      isPredominant: false,
      isMainKey: MAIN_KEY_TAGS.has(tagName),
    }))
    .sort((a, b) => b.count - a.count);

  const topThreshold = Math.max(2, Math.floor(tagFrequencies.length * 0.25));
  tagFrequencies.forEach((tf, index) => {
    if (index < topThreshold || tf.percentage >= 15) {
      tf.isPredominant = true;
    }
  });

  const predominantTagsSet = new Set(
    tagFrequencies.filter((tf) => tf.isPredominant).map((tf) => tf.tagName)
  );

  function annotatePredominant(node: XmlTreeNode) {
    if (predominantTagsSet.has(node.tagName)) {
      node.isPredominant = true;
    }
    node.children.forEach(annotatePredominant);
  }
  annotatePredominant(rootNode);

  return {
    rootNode,
    initialValues,
    tagFrequencies,
    totalNodeCount: totalNodes,
    maxDepth: maxDepthObserved,
    headerSummary,
    drawings,
    assemblies,
    error: null,
  };
}

// ==========================================
// MAIN COMPONENT: TEKLA POWERFAB XML VIEWER
// ==========================================
export const XmlTreeViewerApp: React.FC = () => {
  const { navigate } = useNavigation();
  const { isDark, toggleTheme } = useTheme();

  // State
  const [xmlInput, setXmlInput] = useState<string>(SAMPLES.teklaPowerFab);
  const [activeSampleKey, setActiveSampleKey] = useState<string>('teklaPowerFab');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tree' | 'details' | 'summary' | 'stats' | 'raw'>('tree');
  const [selectedNode, setSelectedNode] = useState<XmlTreeNode | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [autoExpandDepth, setAutoExpandDepth] = useState<number>(4);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  // Modal State for Main Key Item Details
  const [selectedDetailItem, setSelectedDetailItem] = useState<{
    type: 'drawing' | 'assembly';
    item: ExtractedTeklaDrawing | ExtractedTeklaAssembly;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-fetch the user's primary sample XML on mount
  useEffect(() => {
    setIsLoadingSample(true);
    fetch('/assets/aistudio/Template_XML_5b1b4e98.xml')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then((text) => {
        if (text && text.includes('FabSuiteDataExchange')) {
          setXmlInput(text);
          setActiveSampleKey('teklaPowerFabSampleFile');
        }
      })
      .catch((err) => {
        console.warn('Could not load full sample file, using default preset:', err);
      })
      .finally(() => {
        setIsLoadingSample(false);
      });
  }, []);

  // Parse XML
  const parsedData = useMemo(() => {
    return parseXmlToTree(xmlInput);
  }, [xmlInput]);

  const {
    rootNode,
    initialValues,
    tagFrequencies,
    totalNodeCount,
    maxDepth,
    headerSummary,
    drawings,
    assemblies,
    error,
  } = parsedData;

  // Auto-expand nodes up to AssemblyData / DrawingData depth
  useEffect(() => {
    if (!rootNode) return;
    const newExpanded = new Set<string>();

    function expandToTarget(node: XmlTreeNode) {
      if (node.depth <= autoExpandDepth || node.isMainKey) {
        newExpanded.add(node.id);
      }
      node.children.forEach(expandToTarget);
    }

    expandToTarget(rootNode);
    setExpandedNodeIds(newExpanded);
    setSelectedNode(rootNode);
  }, [rootNode, autoExpandDepth]);

  // Handle Search & Filter Matching
  const searchResults = useMemo(() => {
    if (!rootNode) return { matchedIds: new Set<string>(), matchedList: [] as XmlTreeNode[] };

    const q = searchQuery.trim().toLowerCase();
    if (!q && selectedTagFilter === 'all') {
      return { matchedIds: new Set<string>(), matchedList: [] };
    }

    const matchedIds = new Set<string>();
    const matchedList: XmlTreeNode[] = [];

    function searchNode(node: XmlTreeNode) {
      let isMatch = true;

      if (selectedTagFilter === 'mainKeysOnly') {
        if (!node.isMainKey) isMatch = false;
      } else if (selectedTagFilter !== 'all' && node.tagName !== selectedTagFilter) {
        isMatch = false;
      }

      if (q && isMatch) {
        const tagMatch = node.tagName.toLowerCase().includes(q);
        const textMatch = node.textContent?.toLowerCase().includes(q);
        const pathMatch = node.fullPath.toLowerCase().includes(q);
        const attrMatch = Object.entries(node.attributes).some(
          ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );

        isMatch = tagMatch || textMatch || pathMatch || attrMatch;
      }

      if (isMatch) {
        matchedIds.add(node.id);
        matchedList.push(node);
      }

      node.children.forEach(searchNode);
    }

    searchNode(rootNode);
    return { matchedIds, matchedList };
  }, [rootNode, searchQuery, selectedTagFilter]);

  // Auto-expand matched search nodes
  useEffect(() => {
    if (!rootNode || (!searchQuery.trim() && selectedTagFilter === 'all')) return;

    if (searchResults.matchedList.length > 0) {
      const newExpanded = new Set(expandedNodeIds);

      function expandParents(node: XmlTreeNode, targetIds: Set<string>): boolean {
        let childHasMatch = false;
        node.children.forEach((child) => {
          if (expandParents(child, targetIds)) {
            childHasMatch = true;
          }
        });

        if (targetIds.has(node.id) || childHasMatch) {
          newExpanded.add(node.id);
          return true;
        }
        return false;
      }

      expandParents(rootNode, searchResults.matchedIds);
      setExpandedNodeIds(newExpanded);
    }
  }, [searchQuery, selectedTagFilter, searchResults]);

  // Flatten visible nodes for Virtualized Windowing
  const visibleFlatList = useMemo(() => {
    if (!rootNode) return [];

    const list: VisibleFlatNode[] = [];

    function flatten(node: XmlTreeNode) {
      const isMatched = searchResults.matchedIds.has(node.id);
      const hasChildren = node.children.length > 0;
      const isExpanded = expandedNodeIds.has(node.id);

      list.push({
        node,
        depth: node.depth,
        hasChildren,
        isExpanded,
        isMatched,
        isPredominant: !!node.isPredominant,
        isMainKey: !!node.isMainKey,
      });

      if (hasChildren && isExpanded) {
        node.children.forEach(flatten);
      }
    }

    flatten(rootNode);
    return list;
  }, [rootNode, expandedNodeIds, searchResults]);

  // Virtualization Scroll Math
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 560;
  const rowHeight = 38;

  const totalHeight = visibleFlatList.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
  const endIndex = Math.min(
    visibleFlatList.length - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + 5
  );

  const virtualRows = useMemo(() => {
    return visibleFlatList.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index,
      topPx: (startIndex + index) * rowHeight,
    }));
  }, [visibleFlatList, startIndex, endIndex, rowHeight]);

  // Expand / Collapse Handlers
  const toggleNodeExpand = useCallback((nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleExpandAll = () => {
    if (!rootNode) return;
    const allIds = new Set<string>();
    function collect(n: XmlTreeNode) {
      if (n.children.length > 0) allIds.add(n.id);
      n.children.forEach(collect);
    }
    collect(rootNode);
    setExpandedNodeIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodeIds(new Set());
  };

  const handleSetExpandDepth = (depth: number) => {
    if (!rootNode) return;
    setAutoExpandDepth(depth);
    const newExpanded = new Set<string>();
    function collect(n: XmlTreeNode) {
      if (n.depth <= depth && n.children.length > 0) {
        newExpanded.add(n.id);
      }
      n.children.forEach(collect);
    }
    collect(rootNode);
    setExpandedNodeIds(newExpanded);
  };

  // Upload File Handler
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setXmlInput(e.target.result);
        setActiveSampleKey('custom');
      }
    };
    reader.readAsText(file);
  };

  // Copy Snippet Helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(label);
      setTimeout(() => setCopyStatus(null), 2200);
    });
  };

  // Format node XML snippet
  const formatNodeXml = (node: XmlTreeNode): string => {
    const attrs = Object.entries(node.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const attrStr = attrs ? ` ${attrs}` : '';

    if (node.children.length === 0) {
      if (node.textContent) {
        return `<${node.tagName}${attrStr}>${node.textContent}</${node.tagName}>`;
      }
      return `<${node.tagName}${attrStr} />`;
    }
    return `<${node.tagName}${attrStr}> (${node.children.length} child elements) ...</${node.tagName}>`;
  };

  // Switch to Tree View and focus item
  const handleJumpToTreeItem = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    setActiveTab('tree');
    setSelectedDetailItem(null);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Banner Header */}
      <div className={`border-b sticky top-20 z-30 backdrop-blur-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
              <FolderTree className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Tekla PowerFab XML Viewer
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Target Depth: Assembly & Drawing Data
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Focused XML Explorer for Tekla PowerFab & FabSuite Data Exchange schemas. Summarizes pre-depth project headers and highlights key Assembly & Drawing datasets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Dark / Light Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Tekla XML</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xml,.text,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Sample Selectors & File Status Bar */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              XML Presets:
            </span>
            <button
              onClick={() => {
                setIsLoadingSample(true);
                fetch('/assets/aistudio/Template_XML_5b1b4e98.xml')
                  .then((res) => res.text())
                  .then((t) => { setXmlInput(t); setActiveSampleKey('teklaPowerFabSampleFile'); })
                  .finally(() => setIsLoadingSample(false));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSampleKey === 'teklaPowerFabSampleFile'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-950" />
              <span>Tekla PowerFab Sample (Project #26066)</span>
            </button>
            <button
              onClick={() => { setXmlInput(SAMPLES.teklaPowerFab); setActiveSampleKey('teklaPowerFab'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSampleKey === 'teklaPowerFab'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📐 Mini Tekla XML
            </button>
            <button
              onClick={() => { setXmlInput(SAMPLES.transmittal); setActiveSampleKey('transmittal'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeSampleKey === 'transmittal'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📋 Transmittal XML
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {isLoadingSample && (
              <span className="text-amber-400 font-bold animate-pulse text-[11px]">
                Loading Tekla XML...
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-lg border font-bold ${
              error
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {error ? '❌ Parse Error' : `✓ ${totalNodeCount.toLocaleString()} Total Nodes`}
            </span>
            <span className={`px-2.5 py-1 rounded-lg border font-bold ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              Max Depth: {maxDepth}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-3 shadow-lg">
            <X className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-rose-200 block text-sm mb-1">XML Syntax Error Detected</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* SUMMARIZED PRE-DEPTH HEADER CARD */}
        {!error && (
          <div className={`rounded-2xl border p-5 space-y-4 transition-colors ${
            isDark ? 'bg-slate-900/90 border-amber-500/30 shadow-xl' : 'bg-white border-amber-200 shadow-md'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800/80">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                  Summarized Tekla PowerFab Pre-Depth Header Info
                </h2>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold">
                  Metadata prior to Assembly/Drawing Depth
                </span>
              </div>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Project # {headerSummary.projectNumber || '26066'} &bull; {headerSummary.projectName || 'TCA Phase II'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Project Number</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  {headerSummary.projectNumber || '26066'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 col-span-2 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Project Name</span>
                <span className="text-xs font-bold text-slate-100 truncate">
                  {headerSummary.projectName || 'TCA PHASE II - HIGH SCHOOL + GYM ADDITIONS'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Source App</span>
                <span className="text-xs font-semibold text-cyan-300 truncate font-mono">
                  {headerSummary.sourceApp || 'Tekla Structures'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Exchange Ver.</span>
                <span className="text-xs font-semibold text-purple-300 font-mono">
                  v{headerSummary.version || '1.09'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 ${
                isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assembly Datasets</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {headerSummary.totalAssemblies || assemblies.length || 39} Assemblies
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'tree'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <ListTree className="w-4 h-4" />
              <span>Tekla Tree Explorer</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950/20 text-[10px]">
                {visibleFlatList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Target className="w-4 h-4 text-amber-950" />
              <span>🎯 Main Keys Details (Assembly & Drawing Data)</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Initial Values ({initialValues.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tag Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Raw Tekla XML</span>
            </button>
          </div>
        </div>

        {/* TAB 1: VIRTUALIZED TEKLA TREE VIEW */}
        {activeTab === 'tree' && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Controls Bar */}
              <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                    isDark ? 'bg-slate-950 border-slate-800 focus-within:border-amber-500' : 'bg-slate-50 border-slate-300 focus-within:border-amber-500'
                  }`}>
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search drawings, assembly marks, profiles, attributes..."
                      className="w-full bg-transparent text-xs text-inherit focus:outline-none placeholder:text-slate-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 hover:text-rose-400 text-slate-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedTagFilter}
                    onChange={(e) => setSelectedTagFilter(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="all">All Elements</option>
                    <option value="mainKeysOnly">🎯 Main Keys Only (Assembly/Drawing)</option>
                    {tagFrequencies.map((tf) => (
                      <option key={tf.tagName} value={tf.tagName}>
                        {tf.isMainKey ? '🎯 ' : tf.isPredominant ? '🔥 ' : ''}&lt;{tf.tagName}&gt; ({tf.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExpandAll}
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition ${
                        isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" /> Expand All
                    </button>
                    <button
                      onClick={handleCollapseAll}
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 cursor-pointer transition ${
                        isDark ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" /> Collapse All
                    </button>

                    <div className="flex items-center gap-1 border-l pl-2 border-slate-800">
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Depth:</span>
                      {[1, 2, 3, 4, 5].map((d) => (
                        <button
                          key={d}
                          onClick={() => handleSetExpandDepth(d)}
                          className={`w-6 h-6 rounded font-mono text-[11px] font-bold cursor-pointer transition ${
                            autoExpandDepth === d
                              ? 'bg-amber-500 text-slate-950'
                              : isDark ? 'bg-slate-950 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {searchResults.matchedList.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {searchResults.matchedList.length} Match{searchResults.matchedList.length === 1 ? '' : 'es'}
                      </span>
                    )}
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      Visible Rows: <strong className="text-amber-400">{visibleFlatList.length}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Virtualized Tree Container */}
              <div
                ref={treeContainerRef}
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                style={{ height: `${containerHeight}px` }}
                className={`rounded-2xl border overflow-y-auto relative font-mono text-xs shadow-xl transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {visibleFlatList.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Search className="w-8 h-8 mx-auto text-slate-600" />
                    <p>No XML elements match filter criteria.</p>
                  </div>
                ) : (
                  <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
                    {virtualRows.map(({ node, depth, hasChildren, isExpanded, isMatched, isPredominant, isMainKey, topPx }) => {
                      const isSelected = selectedNode?.id === node.id;

                      return (
                        <div
                          key={node.id}
                          style={{
                            position: 'absolute',
                            top: `${topPx}px`,
                            left: 0,
                            right: 0,
                            height: `${rowHeight}px`,
                          }}
                          onClick={() => setSelectedNode(node)}
                          className={`flex items-center gap-2 px-3 hover:bg-amber-500/10 cursor-pointer border-b transition-all border-slate-900/50 ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-200 font-semibold'
                              : isMatched
                              ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                              : isMainKey
                              ? 'bg-purple-900/20 text-purple-200'
                              : isDark ? 'text-slate-300' : 'text-slate-800'
                          }`}
                        >
                          <div style={{ width: `${(depth - 1) * 20}px` }} className="shrink-0" />

                          {hasChildren ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNodeExpand(node.id);
                              }}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-amber-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          ) : (
                            <span className="w-6 shrink-0 text-slate-600 text-center font-bold">&bull;</span>
                          )}

                          {isMainKey && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-sans font-bold shrink-0 flex items-center gap-0.5">
                              <Target className="w-2.5 h-2.5 text-purple-400" />
                              <span>Key</span>
                            </span>
                          )}

                          {isPredominant && !isMainKey && (
                            <span
                              className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-sans font-bold shrink-0 flex items-center gap-0.5"
                              title="Predominant Repeating Element"
                            >
                              <Flame className="w-2.5 h-2.5 text-amber-400" />
                            </span>
                          )}

                          <span className={`font-bold hover:underline shrink-0 ${
                            isMainKey ? 'text-amber-400' : 'text-cyan-400'
                          }`}>
                            &lt;{node.tagName}
                          </span>

                          {Object.keys(node.attributes).length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11px] shrink-1">
                              {Object.entries(node.attributes).map(([k, v]) => (
                                <span key={k} className="inline-flex items-center text-amber-300 truncate max-w-[200px]">
                                  <span className="text-slate-400 mr-0.5">{k}=</span>
                                  <span className="text-emerald-300 font-semibold">"{v}"</span>
                                </span>
                              ))}
                            </div>
                          )}

                          <span className={`${isMainKey ? 'text-amber-400' : 'text-cyan-400'} shrink-0`}>&gt;</span>

                          {hasChildren ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-sans ml-auto shrink-0 font-semibold">
                              {node.elementCount + 1} item{node.elementCount > 0 ? 's' : ''}
                            </span>
                          ) : node.textContent ? (
                            <span className="text-emerald-300 font-sans truncate text-xs font-medium ml-1">
                              {node.textContent}
                            </span>
                          ) : null}

                          {!hasChildren && (
                            <span className={`${isMainKey ? 'text-amber-400' : 'text-cyan-400'} shrink-0 font-bold`}>
                              &lt;/{node.tagName}&gt;
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Inspector Side Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {selectedNode ? (
                <div className={`p-5 rounded-2xl border space-y-4 shadow-xl transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                        Node Inspector
                      </h3>
                    </div>
                    {selectedNode.isMainKey ? (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        🎯 Main Key of Interest
                      </span>
                    ) : selectedNode.isPredominant ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        🔥 Major Element
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Tekla Node Path:</div>
                    <div className={`p-2 rounded-xl border text-[11px] break-all ${
                      isDark ? 'bg-slate-950 border-slate-800 text-amber-300' : 'bg-slate-50 border-slate-200 text-amber-700'
                    }`}>
                      {selectedNode.fullPath}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                      Attributes ({Object.keys(selectedNode.attributes).length}):
                    </div>
                    {Object.keys(selectedNode.attributes).length === 0 ? (
                      <span className="text-xs text-slate-500 italic">None</span>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(selectedNode.attributes).map(([k, v]) => (
                          <div
                            key={k}
                            className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 ${
                              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="text-amber-300 font-bold">{k}</span>
                            <span className="text-emerald-300 truncate max-w-[180px]">"{v}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedNode.textContent && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">Text Value:</div>
                      <div className={`p-2.5 rounded-xl border text-xs font-mono break-words leading-relaxed ${
                        isDark ? 'bg-slate-950 border-slate-800 text-emerald-300' : 'bg-slate-50 border-slate-200 text-emerald-700'
                      }`}>
                        {selectedNode.textContent}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans font-bold">
                      <span>XML Snippet:</span>
                      <button
                        onClick={() => handleCopyText(formatNodeXml(selectedNode), 'XML Snippet')}
                        className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={formatNodeXml(selectedNode)}
                      className={`w-full p-2.5 rounded-xl border text-[11px] font-mono leading-relaxed focus:outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  {copyStatus && (
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
                      ✓ Copied {copyStatus} to clipboard!
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border text-center space-y-2 text-slate-500 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <Info className="w-6 h-6 mx-auto text-slate-600" />
                  <p className="text-xs">Click any node in the tree to inspect its XML parameters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MAIN KEYS OF INTEREST DETAILS (CLICK ROW FOR COMPLETE ITEM DETAIL MODAL) */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Drawings Table */}
            <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black text-amber-300">
                    Drawing Data Details (<span className="text-cyan-400">{drawings.length}</span> Records)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400/90 font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    💡 Click any row to view complete details
                  </span>
                </div>
              </div>

              {drawings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No &lt;DrawingData&gt; records found in current XML.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                        isDark ? 'border-slate-800 text-slate-400 bg-slate-950/60' : 'border-slate-200 text-slate-600 bg-slate-100'
                      }`}>
                        <th className="p-3">Drawing #</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Rev #</th>
                        <th className="p-3">Rev Description</th>
                        <th className="p-3">Date Revised</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {drawings.slice(0, 80).map((d) => (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDetailItem({ type: 'drawing', item: d })}
                          className={`cursor-pointer transition-colors group ${
                            isDark ? 'hover:bg-amber-500/10' : 'hover:bg-amber-50'
                          }`}
                        >
                          <td className="p-3 font-bold text-amber-400 group-hover:underline flex items-center gap-1.5">
                            <span>{d.drawingNumber}</span>
                          </td>
                          <td className="p-3 text-slate-100 font-semibold">{d.drawingTitle}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                              {d.category}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-emerald-400">{d.revisionNumber}</td>
                          <td className="p-3 text-slate-300">{d.revisionDescription || 'For Fabrication'}</td>
                          <td className="p-3 text-slate-400 text-[11px]">{d.dateRevised || d.dateDetailed || '-'}</td>
                          <td className="p-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-sans font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Details
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {drawings.length > 80 && (
                    <div className="p-3 text-center text-slate-500 text-xs italic border-t border-slate-800">
                      Showing first 80 of {drawings.length} drawing records. Click any row for complete item inspection.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Assemblies Table */}
            <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-black text-emerald-300">
                    Assembly Data Details (<span className="text-amber-400">{assemblies.length}</span> Records)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400/90 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    💡 Click any row to view complete detail breakdown & part list
                  </span>
                </div>
              </div>

              {assemblies.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  No &lt;AssemblyData&gt; records found in current XML.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                        isDark ? 'border-slate-800 text-slate-400 bg-slate-950/60' : 'border-slate-200 text-slate-600 bg-slate-100'
                      }`}>
                        <th className="p-3">Assembly Mark</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Main Part Mark</th>
                        <th className="p-3">Main Profile</th>
                        <th className="p-3">Length (in)</th>
                        <th className="p-3">Weight (lbs)</th>
                        <th className="p-3">Parts Count</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {assemblies.map((a) => (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedDetailItem({ type: 'assembly', item: a })}
                          className={`cursor-pointer transition-colors group ${
                            isDark ? 'hover:bg-emerald-500/10' : 'hover:bg-emerald-50'
                          }`}
                        >
                          <td className="p-3 font-bold text-emerald-400 group-hover:underline flex items-center gap-1.5">
                            <span>{a.assemblyMark}</span>
                          </td>
                          <td className="p-3 font-bold text-amber-300">{a.quantity}</td>
                          <td className="p-3 text-cyan-300">{a.mainPartMark}</td>
                          <td className="p-3 font-bold text-purple-300">{a.mainPartProfile}</td>
                          <td className="p-3 text-slate-200">{a.lengthInches}"</td>
                          <td className="p-3 text-slate-200">{a.weightLbs} lbs</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              {a.partsCount} part{a.partsCount === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-bold group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Full Detail
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INITIAL VALUES & PROLOG */}
        {activeTab === 'summary' && (
          <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Separated Initial Values & Global Parameters</span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Extracted XML declarations, root namespaces, and top-level header parameters prior to Assembly & Drawing data.
                </p>
              </div>
              <button
                onClick={() => {
                  const txt = initialValues.map((iv) => `${iv.key}: ${iv.value}`).join('\n');
                  handleCopyText(txt, 'Initial Values');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer text-slate-200"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" /> Copy All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                    isDark ? 'border-slate-800 text-slate-400 bg-slate-950/60' : 'border-slate-200 text-slate-600 bg-slate-100'
                  }`}>
                    <th className="p-3">Category</th>
                    <th className="p-3">Parameter / Path</th>
                    <th className="p-3">Extracted Initial Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {initialValues.map((iv, idx) => (
                    <tr key={idx} className={isDark ? 'hover:bg-slate-950/50' : 'hover:bg-slate-50'}>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                          iv.category === 'prolog'
                            ? 'bg-purple-500/20 text-purple-300'
                            : iv.category === 'root_attr'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          {iv.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-cyan-400">{iv.key}</td>
                      <td className="p-3 text-emerald-300 break-all">{iv.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TAG ANALYTICS */}
        {activeTab === 'stats' && (
          <div className={`p-6 rounded-2xl border space-y-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="border-b pb-3 border-slate-800 space-y-1">
              <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Tekla Tag Frequency & Element Importance</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Elements making up most of the file are prioritized during tree navigation.
              </p>
            </div>

            <div className="space-y-4">
              {tagFrequencies.map((tf) => (
                <div key={tf.tagName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      {tf.isMainKey ? (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-sans text-[10px] font-bold">
                          🎯 Main Key
                        </span>
                      ) : tf.isPredominant ? (
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                      ) : null}
                      &lt;{tf.tagName}&gt;
                    </span>
                    <span className="font-bold text-amber-300">
                      {tf.count} instances ({tf.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${Math.max(4, tf.percentage)}%` }}
                      className={`h-full rounded-full transition-all ${
                        tf.isMainKey
                          ? 'bg-gradient-to-r from-purple-500 to-amber-400'
                          : tf.isPredominant
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                          : 'bg-cyan-500/60'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RAW XML */}
        {activeTab === 'raw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Raw Tekla XML Text View & Editor
              </span>
              <button
                onClick={() => handleCopyText(xmlInput, 'Raw Tekla XML')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" /> Copy Full XML
              </button>
            </div>
            <textarea
              value={xmlInput}
              onChange={(e) => {
                setXmlInput(e.target.value);
                setActiveSampleKey('custom');
              }}
              rows={18}
              className={`w-full p-4 rounded-2xl border font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>
        )}
      </div>

      {/* COMPLETE ITEM DETAIL MODAL */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className={`border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  selectedDetailItem.type === 'drawing'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedDetailItem.type === 'drawing' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : (
                    <Box className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-amber-300 font-mono">
                      {selectedDetailItem.type === 'drawing'
                        ? (selectedDetailItem.item as ExtractedTeklaDrawing).drawingNumber
                        : (selectedDetailItem.item as ExtractedTeklaAssembly).assemblyMark}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      selectedDetailItem.type === 'drawing'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {selectedDetailItem.type === 'drawing' ? 'Drawing Record' : 'Assembly Record'}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Complete XML Data Breakdown & Child Node Fields
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Bar inside Modal */}
            <div className={`px-6 py-2.5 border-b flex items-center justify-between text-xs gap-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleJumpToTreeItem(
                      selectedDetailItem.type === 'drawing'
                        ? (selectedDetailItem.item as ExtractedTeklaDrawing).drawingNumber
                        : (selectedDetailItem.item as ExtractedTeklaAssembly).assemblyMark
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ListTree className="w-3.5 h-3.5" /> Inspect in Tree View
                </button>
                <button
                  onClick={() => handleCopyText(selectedDetailItem.item.rawXml, 'Item Raw XML')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" /> Copy Raw XML
                </button>
              </div>

              {copyStatus && (
                <span className="text-emerald-400 font-bold animate-fadeIn">
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* DRAWING DETAILS VIEW */}
              {selectedDetailItem.type === 'drawing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries((selectedDetailItem.item as ExtractedTeklaDrawing).rawFields).map(([key, val]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-1 font-mono text-xs ${
                          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{key}:</span>
                        <span className="font-bold text-amber-300 break-words">{val}</span>
                      </div>
                    ))}

                    <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 font-mono text-xs ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Revision Number:</span>
                      <span className="font-bold text-emerald-400">
                        {(selectedDetailItem.item as ExtractedTeklaDrawing).revisionNumber}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 font-mono text-xs ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Revision Notes:</span>
                      <span className="font-bold text-slate-200">
                        {(selectedDetailItem.item as ExtractedTeklaDrawing).revisionDescription || 'For Fabrication'}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1 font-mono text-xs col-span-1 sm:col-span-2 lg:col-span-3 ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Tekla ModelRef:</span>
                      <span className="font-mono text-cyan-300 text-xs break-all">
                        {(selectedDetailItem.item as ExtractedTeklaDrawing).modelRef || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ASSEMBLY DETAILS VIEW */}
              {selectedDetailItem.type === 'assembly' && (
                <div className="space-y-6">
                  {/* Summary Attributes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div className={`p-3 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assembly Mark:</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {(selectedDetailItem.item as ExtractedTeklaAssembly).assemblyMark}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantity:</span>
                      <span className="font-extrabold text-amber-300 text-sm">
                        {(selectedDetailItem.item as ExtractedTeklaAssembly).quantity}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Main Profile:</span>
                      <span className="font-bold text-purple-300">
                        {(selectedDetailItem.item as ExtractedTeklaAssembly).mainPartProfile}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Length & Weight:</span>
                      <span className="font-bold text-slate-200">
                        {(selectedDetailItem.item as ExtractedTeklaAssembly).lengthInches}" &bull; {(selectedDetailItem.item as ExtractedTeklaAssembly).weightLbs} lbs
                      </span>
                    </div>
                  </div>

                  {/* Assembly Parts Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                        <Box className="w-4 h-4 text-emerald-400" />
                        <span>Assembly Parts List ({(selectedDetailItem.item as ExtractedTeklaAssembly).parts.length} Child Parts)</span>
                      </h3>
                    </div>

                    {(selectedDetailItem.item as ExtractedTeklaAssembly).parts.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/50 text-slate-500 text-xs font-mono text-center">
                        No child &lt;AssemblyPart&gt; sub-elements found for this assembly.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left font-mono text-xs border-collapse">
                          <thead>
                            <tr className={`border-b text-[10px] uppercase font-bold ${
                              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              <th className="p-2.5">Part Mark</th>
                              <th className="p-2.5">Part Profile</th>
                              <th className="p-2.5">Qty</th>
                              <th className="p-2.5">Length</th>
                              <th className="p-2.5">Weight</th>
                              <th className="p-2.5">Material Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {(selectedDetailItem.item as ExtractedTeklaAssembly).parts.map((pt, ptIdx) => (
                              <tr key={ptIdx} className={isDark ? 'hover:bg-slate-950/60' : 'hover:bg-slate-50'}>
                                <td className="p-2.5 font-bold text-amber-300">{pt.partMark}</td>
                                <td className="p-2.5 font-bold text-purple-300">{pt.partProfile}</td>
                                <td className="p-2.5 text-slate-200 font-bold">{pt.quantity}</td>
                                <td className="p-2.5 text-slate-300">{pt.length}"</td>
                                <td className="p-2.5 text-slate-300">{pt.weight} lbs</td>
                                <td className="p-2.5 text-cyan-300 font-semibold">{pt.materialGrade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RAW FORMATTED XML SNIPPET */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Raw Formatted XML Element Code:</span>
                </div>
                <pre className={`p-4 rounded-xl border font-mono text-[11px] leading-relaxed overflow-x-auto ${
                  isDark ? 'bg-slate-950 border-slate-800 text-emerald-300' : 'bg-slate-50 border-slate-200 text-emerald-700'
                }`}>
                  <code>{selectedDetailItem.item.rawXml}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XmlTreeViewerApp;
