// Known-safe and known-restrictive license identifiers 
const SAFE_LICENSES = new Set([
  "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause",
  "ISC", "CC0-1.0", "Unlicense", "Python-2.0"
]);

const RESTRICTED_LICENSES = new Set([
  "GPL-2.0", "GPL-3.0", "AGPL-3.0", "LGPL-2.1", "LGPL-3.0"
]);

// PyPI trove classifiers -> canonical identifier.
const LICENSE_CLASSIFIER_MAP = {
  "License :: OSI Approved :: MIT License": "MIT",
  "License :: OSI Approved :: Apache Software License": "Apache-2.0",
  "License :: OSI Approved :: BSD License": "BSD-3-Clause",
  "License :: OSI Approved :: ISC License (ISCL)": "ISC",
  "License :: OSI Approved :: GNU General Public License v2 (GPLv2)": "GPL-2.0",
  "License :: OSI Approved :: GNU General Public License v3 (GPLv3)": "GPL-3.0",
  "License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)": "GPL-3.0",
  "License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)": "LGPL-3.0",
  "License :: OSI Approved :: GNU Lesser General Public License v2 (LGPLv2)": "LGPL-2.1",
  "License :: OSI Approved :: GNU Affero General Public License v3": "AGPL-3.0",
  "License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)": "MPL-2.0",
  "License :: OSI Approved :: The Unlicense (Unlicense)": "Unlicense",
  "License :: OSI Approved :: Python Software Foundation License": "Python-2.0",
  "License :: Public Domain": "Public Domain"
};

// Free-text aliases -> canonical identifier. Keys are matched lowercase.
const LICENSE_ALIASES = {
  "mit license": "MIT", "mit": "MIT",
  "apache software license": "Apache-2.0", "apache license 2.0": "Apache-2.0",
  "apache 2.0": "Apache-2.0", "apache-2.0": "Apache-2.0", "apache2.0": "Apache-2.0",
  "bsd license": "BSD-3-Clause", "bsd": "BSD-3-Clause",
  "bsd-3-clause": "BSD-3-Clause", "bsd 3-clause": "BSD-3-Clause", "new bsd license": "BSD-3-Clause",
  "bsd-2-clause": "BSD-2-Clause", "bsd 2-clause": "BSD-2-Clause", "simplified bsd license": "BSD-2-Clause",
  "isc license": "ISC", "isc license (iscl)": "ISC", "isc": "ISC",
  "gnu general public license v2 (gplv2)": "GPL-2.0", "gpl-2.0": "GPL-2.0", "gplv2": "GPL-2.0", "gpl v2": "GPL-2.0",
  "gnu general public license v3 (gplv3)": "GPL-3.0", "gpl-3.0": "GPL-3.0", "gplv3": "GPL-3.0", "gpl v3": "GPL-3.0",
  "gnu lesser general public license v2 (lgplv2)": "LGPL-2.1", "lgpl-2.1": "LGPL-2.1", "lgplv2": "LGPL-2.1",
  "gnu lesser general public license v3 (lgplv3)": "LGPL-3.0", "lgpl-3.0": "LGPL-3.0", "lgplv3": "LGPL-3.0",
  "gnu affero general public license v3": "AGPL-3.0", "agpl-3.0": "AGPL-3.0", "agplv3": "AGPL-3.0",
  "mozilla public license 2.0 (mpl 2.0)": "MPL-2.0", "mpl-2.0": "MPL-2.0", "mpl 2.0": "MPL-2.0",
  "the unlicense (unlicense)": "Unlicense", "unlicense": "Unlicense",
  "python software foundation license": "Python-2.0", "psf license": "Python-2.0",
  "cc0 1.0 universal": "CC0-1.0", "cc0-1.0": "CC0-1.0", "cc0": "CC0-1.0",
  "public domain": "Public Domain"
};

// Ordered signatures for classifying long, pasted-in license text.
// Order matters: more specific patterns are checked before their broader relatives.
const LICENSE_TEXT_SIGNATURES = [
  { id: "Apache-2.0", pattern: /apache license[,]?\s*version 2\.0/i },
  { id: "GPL-3.0", pattern: /gnu general public license[\s\S]{0,60}version 3/i },
  { id: "GPL-2.0", pattern: /gnu general public license[\s\S]{0,60}version 2/i },
  { id: "LGPL-3.0", pattern: /gnu lesser general public license[\s\S]{0,60}version 3/i },
  { id: "LGPL-2.1", pattern: /gnu lesser general public license[\s\S]{0,60}version 2\.1/i },
  { id: "AGPL-3.0", pattern: /gnu affero general public license/i },
  { id: "MPL-2.0", pattern: /mozilla public license[\s\S]{0,10}version 2\.0/i },
  { id: "BSD-3-Clause", pattern: /neither the name of[\s\S]{0,120}nor the names of its contributors/i },
  { id: "BSD-2-Clause", pattern: /redistribution and use in source and binary forms/i },
  { id: "MIT", pattern: /permission is hereby granted, free of charge/i },
  { id: "ISC", pattern: /permission to use, copy, modify(?:, and\/or distribute)? this software for any purpose/i },
  { id: "Unlicense", pattern: /this is free and unencumbered software released into the public domain/i }
];
