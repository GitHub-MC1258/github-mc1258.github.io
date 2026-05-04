---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date.Format "2006-01-02 15:04:05" }}
draft: false
weight: 10
---
